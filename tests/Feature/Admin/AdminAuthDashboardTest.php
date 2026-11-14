<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('guest visiting admin dashboard is redirected to admin login', function () {
    $this->get('/admin/dashboard')
        ->assertRedirect('/admin/login');
});

test('admin login page renders successfully', function () {
    $this->get('/admin/login')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/Auth/Login'));
});

test('admin register page renders successfully', function () {
    $this->get('/admin/register')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/Auth/Register'));
});

test('user can login via admin login and access dashboard', function () {
    $user = User::factory()->create([
        'email' => 'admin@zeefolio.test',
        'password' => Hash::make('secret123'),
    ]);

    $this->post('/admin/login', [
        'email' => 'admin@zeefolio.test',
        'password' => 'secret123',
    ])->assertRedirect('/admin/dashboard');

    $this->assertAuthenticatedAs($user);

    $this->get('/admin/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->has('stats')
            ->has('portfolioSummary')
            ->has('recentProjects')
            ->has('recentLogs')
        );
});

test('user cannot login with invalid credentials', function () {
    User::factory()->create([
        'email' => 'admin@zeefolio.test',
        'password' => Hash::make('secret123'),
    ]);

    $this->from('/admin/login')
        ->post('/admin/login', [
            'email' => 'admin@zeefolio.test',
            'password' => 'wrong-password',
        ])
        ->assertRedirect('/admin/login')
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});

test('user can register via admin register and is redirected to dashboard', function () {
    $this->post('/admin/register', [
        'name' => 'Zee Admin',
        'username' => 'zeeadmin',
        'email' => 'zee@zeefolio.test',
        'password' => 'password123',
    ])->assertRedirect('/admin/dashboard');

    $this->assertAuthenticated();
    $this->assertDatabaseHas('users', [
        'email' => 'zee@zeefolio.test',
        'username' => 'zeeadmin',
    ]);
});

test('authenticated user can logout from admin', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/admin/logout')
        ->assertRedirect('/admin/login');

    $this->assertGuest();
});

