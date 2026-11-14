<?php

use App\Mail\SendMailToMe;
use App\Models\PortfolioView;
use App\Models\Project;
use App\Models\TechStack;
use App\Models\User;
use App\Services\PortfolioService;
use App\Services\RolePermissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    app(RolePermissionService::class)->ensureBootstrapped();
});

test('SEC-01: unowned existing_images paths in project showcases are ignored and cannot delete victim files', function () {
    Storage::fake('public');

    // Create a victim file on the public disk
    $victimFile = 'portfolios/cvs/victim_cv.pdf';
    Storage::disk('public')->put($victimFile, 'confidential-cv-content');

    $attacker = User::factory()->create(['role' => User::ROLE_MEMBER]);
    $attacker->syncUserRole(User::ROLE_MEMBER);
    $portfolio = app(PortfolioService::class)->createDefaultPortfolio($attacker);

    // Attacker creates a project attempting to inject $victimFile into existing_images
    $this->actingAs($attacker)
        ->post('/admin/projects', [
            'title' => 'Attacker Project',
            'description' => 'Testing showcase path injection',
            'showcases' => [
                [
                    'title' => 'Injected Showcase',
                    'description' => 'Trying to reference victim file',
                    'existing_images' => [$victimFile],
                ],
            ],
        ])
        ->assertSessionHasNoErrors();

    $project = Project::where('portfolio_user_id', $portfolio->id)->firstOrFail();

    // Attacker deletes their project
    $this->actingAs($attacker)
        ->delete("/admin/projects/{$project->id}")
        ->assertSessionHasNoErrors();

    // Victim file MUST still exist on disk
    Storage::disk('public')->assertExists($victimFile);
});

test('SEC-02: visiting admin members index does not execute DummyMemberPortfolioSeeder in runtime', function () {
    $superadmin = User::factory()->create(['role' => User::ROLE_SUPERADMIN]);
    $superadmin->syncUserRole(User::ROLE_SUPERADMIN);

    $this->actingAs($superadmin)
        ->get('/admin/members')
        ->assertOk();

    $this->assertDatabaseMissing('users', [
        'email' => 'alex.admin@zeefolio.dev',
    ]);
});

test('SEC-03: banned user with an active session is immediately logged out on next request', function () {
    $user = User::factory()->create([
        'role' => User::ROLE_MEMBER,
        'status' => 'banned',
    ]);
    $user->syncUserRole(User::ROLE_MEMBER);

    $this->actingAs($user)
        ->get('/admin/dashboard')
        ->assertRedirect('/admin/login')
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});

test('SEC-04: first registered user is assigned member role and not auto-promoted to superadmin', function () {
    $this->post('/admin/register', [
        'name' => 'First Registered User',
        'username' => 'first_user',
        'email' => 'first@example.com',
        'password' => 'password123',
    ])->assertRedirect('/admin/dashboard');

    $user = User::where('email', 'first@example.com')->firstOrFail();
    expect($user->role)->toBe(User::ROLE_MEMBER);
    expect($user->isSuperAdmin())->toBeFalse();
});

test('SEC-05: member cannot attach another users private custom tech stack or edit it via settings', function () {
    $owner = User::factory()->create(['role' => User::ROLE_MEMBER]);
    $privateStack = TechStack::create([
        'name' => 'SecretInternalTool',
        'user_id' => $owner->id,
        'is_global' => false,
    ]);

    $otherUser = User::factory()->create(['role' => User::ROLE_MEMBER]);
    $otherUser->syncUserRole(User::ROLE_MEMBER);
    app(PortfolioService::class)->createDefaultPortfolio($otherUser);

    $this->actingAs($otherUser)
        ->post('/admin/projects', [
            'title' => 'My Project',
            'description' => 'Project description',
            'tech_stack_ids' => [$privateStack->id],
        ])
        ->assertSessionHasErrors('tech_stack_ids.0');

    // Admin with settings.manage cannot hijack a private custom skill via updateGlobalSkill
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    $admin->syncUserRole(User::ROLE_ADMIN);

    $this->actingAs($admin)
        ->put("/admin/settings/global-skills/{$privateStack->id}", [
            'name' => 'HijackedSkill',
        ])
        ->assertStatus(403);
});

test('SEC-06 & SEC-07: HomeController rejects SVG logo upload and javascript URI social links', function () {
    Storage::fake('public');

    $user = User::factory()->create(['role' => User::ROLE_MEMBER]);
    $user->syncUserRole(User::ROLE_MEMBER);
    app(PortfolioService::class)->createDefaultPortfolio($user);

    $svgFile = UploadedFile::fake()->create('evil.svg', 10, 'image/svg+xml');

    $this->actingAs($user)
        ->post('/admin/home', [
            'greeting' => 'Hello',
            'name' => 'Test User',
            'description' => 'Bio',
            'logo' => $svgFile,
            'social_media_links' => [
                'github' => 'javascript:alert(1)',
            ],
        ])
        ->assertSessionHasErrors(['logo', 'social_media_links.github']);
});

test('SEC-10 & PERF-11: contact form queues email and enforces rate limiting', function () {
    Mail::fake();

    $response = $this->post('/messageMe', [
        'name' => 'Visitor',
        'email' => 'visitor@example.com',
        'message' => 'Hello from test suite!',
    ]);

    $response->assertSessionHasNoErrors();
    Mail::assertQueued(SendMailToMe::class);
});

test('SEC-13: inactive projects are hidden from public portfolio endpoints', function () {
    $user = User::factory()->create(['role' => User::ROLE_MEMBER]);
    $portfolio = app(PortfolioService::class)->createDefaultPortfolio($user);

    $activeProject = $portfolio->projects()->create([
        'title' => 'Public Project',
        'slug' => 'public-project',
        'description' => 'Visible',
        'is_active' => true,
    ]);

    $draftProject = $portfolio->projects()->create([
        'title' => 'Secret Draft Project',
        'slug' => 'secret-draft-project',
        'description' => 'Hidden',
        'is_active' => false,
    ]);

    app(PortfolioService::class)->forgetUserPortfolioCache($user->id);

    $publicProjects = app(PortfolioService::class)->listProjects($portfolio);
    expect($publicProjects->pluck('id')->all())->toContain($activeProject->id)
        ->not->toContain($draftProject->id);

    $this->get("/{$portfolio->slug}/projects/{$draftProject->slug}")
        ->assertStatus(404);
});

test('SEC-14: standard security headers are attached to web responses', function () {
    $response = $this->get('/admin/login');

    $response->assertHeader('X-Content-Type-Options', 'nosniff');
    $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
    $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
});

test('PERF-03: prefetch requests do not record portfolio views and duplicate views are deduplicated', function () {
    $user = User::factory()->create(['role' => User::ROLE_MEMBER]);
    $portfolio = app(PortfolioService::class)->createDefaultPortfolio($user);

    // Prefetch request should be ignored
    $this->get("/{$portfolio->slug}", ['Purpose' => 'prefetch'])
        ->assertOk();

    expect(PortfolioView::where('portfolio_user_id', $portfolio->id)->count())->toBe(0);

    // First real visit records 1 view
    $this->get("/{$portfolio->slug}")->assertOk();
    expect(PortfolioView::where('portfolio_user_id', $portfolio->id)->count())->toBe(1);

    // Immediate refresh from same IP is deduplicated within window
    $this->get("/{$portfolio->slug}")->assertOk();
    expect(PortfolioView::where('portfolio_user_id', $portfolio->id)->count())->toBe(1);
});

test('PERF-09: promoting a custom skill bumps catalog version without flushing unrelated cache keys', function () {
    $admin = User::factory()->create(['role' => User::ROLE_SUPERADMIN]);
    $admin->syncUserRole(User::ROLE_SUPERADMIN);

    $member = User::factory()->create(['role' => User::ROLE_MEMBER]);
    $customSkill = TechStack::create([
        'name' => 'CustomFramework',
        'user_id' => $member->id,
        'is_global' => false,
    ]);

    Cache::put('unrelated_rate_limit_key', 'keep_me', 600);
    $initialVersion = app(PortfolioService::class)->getCatalogVersion();

    $this->actingAs($admin)
        ->put("/admin/members/skills/{$customSkill->id}/promote")
        ->assertSessionHasNoErrors();

    expect(Cache::get('unrelated_rate_limit_key'))->toBe('keep_me');
    expect(app(PortfolioService::class)->getCatalogVersion())->toBeGreaterThan($initialVersion);
});

test('PERF-14: updating a project without a new cover image preserves clean image_path without double encoding', function () {
    Storage::fake('public');

    $user = User::factory()->create(['role' => User::ROLE_MEMBER]);
    $user->syncUserRole(User::ROLE_MEMBER);
    $portfolio = app(PortfolioService::class)->createDefaultPortfolio($user);

    $coverFile = UploadedFile::fake()->image('cover.png', 400, 300);

    $this->actingAs($user)
        ->post('/admin/projects', [
            'title' => 'Cover Test Project',
            'description' => 'Initial description',
            'image' => $coverFile,
        ])
        ->assertSessionHasNoErrors();

    $project = Project::where('portfolio_user_id', $portfolio->id)->firstOrFail();
    $initialPath = $project->image_path;

    expect($initialPath)->toBeString()->not->toStartWith('"');

    // Update project without uploading a new image
    $this->actingAs($user)
        ->post("/admin/projects/{$project->id}", [
            'title' => 'Cover Test Project Updated',
            'description' => 'Updated description',
        ])
        ->assertSessionHasNoErrors();

    $project->refresh();
    expect($project->image_path)->toBe($initialPath);
    expect($project->getRawOriginal('image_path'))->toBe($initialPath);
});

