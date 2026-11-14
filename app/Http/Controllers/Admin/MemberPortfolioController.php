<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TechStack;
use App\Models\User;
use App\Services\LogService;
use App\Services\PortfolioService;
use App\Services\RolePermissionService;
use Database\Seeders\DummyMemberPortfolioSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class MemberPortfolioController extends Controller
{
    public function __construct(
        protected PortfolioService $portfolioService,
        protected LogService $logService,
        protected RolePermissionService $rolePermissionService,
    ) {}

    public function index(Request $request): Response
    {
        $this->rolePermissionService->ensureBootstrapped();

        User::where('role', 'user')->update(['role' => User::ROLE_MEMBER]);

        if (! User::where('email', 'alex.admin@zeefolio.dev')->exists()) {
            app(DummyMemberPortfolioSeeder::class)->run();
            $this->rolePermissionService->syncExistingUsers();
        }

        $actor = $request->user();

        $users = User::with([
            'roles:id,name',
            'portfolioUser.home',
            'portfolioUser.contacts',
            'portfolioUser.projects.techStacks',
            'portfolioUser.experiences',
            'portfolioUser.userSkills.techStack.category',
        ])
            ->orderByRaw("CASE role WHEN 'superadmin' THEN 1 WHEN 'admin' THEN 2 ELSE 3 END")
            ->orderByDesc('created_at')
            ->get();

        $customTechStacksByUser = TechStack::with('category')
            ->whereNotNull('user_id')
            ->orderByDesc('created_at')
            ->get()
            ->groupBy('user_id');

        $members = $users->map(function (User $member) use ($customTechStacksByUser, $actor) {
            $portfolio = $member->portfolioUser;
            $customSkills = ($customTechStacksByUser->get($member->id) ?? collect())->values();
            $normalizedRole = $member->role === 'user' ? User::ROLE_MEMBER : $member->role;

            $canEditAccount = $actor->isSuperAdmin()
                || ($actor->isAdmin() && $member->isMember())
                || $actor->id === $member->id;

            $canChangeRole = $actor->isSuperAdmin() && $actor->id !== $member->id;

            $canDeleteAccount = $actor->id !== $member->id && (
                $actor->isSuperAdmin() || ($actor->isAdmin() && $member->isMember())
            );

            return [
                'id' => $member->id,
                'name' => $member->name,
                'username' => $member->username,
                'email' => $member->email,
                'role' => $normalizedRole,
                'status' => $member->status ?? 'active',
                'bio' => $member->bio,
                'photo_url' => $member->photo_url,
                'last_login_at' => $member->last_login_at,
                'created_at' => $member->created_at,
                'can_edit' => $canEditAccount,
                'can_change_role' => $canChangeRole,
                'can_delete' => $canDeleteAccount,
                'has_portfolio' => (bool) $portfolio,
                'portfolio' => $portfolio ? [
                    'id' => $portfolio->id,
                    'slug' => $portfolio->slug,
                    'theme' => $portfolio->theme,
                    'is_active' => (bool) $portfolio->is_active,
                    'home' => $portfolio->home,
                    'contacts' => $portfolio->contacts,
                    'projects' => $portfolio->projects->map(fn ($p) => [
                        'id' => $p->id,
                        'title' => $p->title,
                        'slug' => $p->slug,
                        'project_type' => $p->project_type,
                        'description' => $p->description,
                        'is_featured' => (bool) $p->is_featured,
                        'tech_stacks' => $p->techStacks->pluck('name')->values(),
                    ])->values(),
                    'experiences' => $portfolio->experiences->values(),
                    'skills' => $portfolio->userSkills->map(fn ($us) => [
                        'id' => $us->id,
                        'proficiency_level' => $us->proficiency_level,
                        'tech_stack' => $us->techStack ? [
                            'id' => $us->techStack->id,
                            'name' => $us->techStack->name,
                            'icon' => $us->techStack->icon,
                            'is_global' => (bool) $us->techStack->is_global,
                            'category' => $us->techStack->category?->name,
                        ] : null,
                    ])->filter(fn ($us) => $us['tech_stack'] !== null)->values(),
                ] : null,
                'custom_skills' => $customSkills->map(fn (TechStack $ts) => [
                    'id' => $ts->id,
                    'name' => $ts->name,
                    'icon' => $ts->icon,
                    'is_global' => (bool) $ts->is_global,
                    'category' => $ts->category?->name,
                    'created_at' => $ts->created_at,
                ]),
            ];
        });

        $availableRoles = Role::where('guard_name', 'web')
            ->orderByRaw("CASE name WHEN 'superadmin' THEN 1 WHEN 'admin' THEN 2 WHEN 'member' THEN 3 ELSE 4 END")
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        return Inertia::render('Admin/Members/Index', [
            'members' => $members,
            'currentUserRole' => $actor->role === 'user' ? User::ROLE_MEMBER : $actor->role,
            'availableRoles' => $availableRoles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->rolePermissionService->ensureBootstrapped();
        $actor = $request->user();

        $allSpatieRoles = Role::where('guard_name', 'web')->pluck('name')->all();
        $allowedRoles = $actor->isSuperAdmin()
            ? ($allSpatieRoles ?: [User::ROLE_SUPERADMIN, User::ROLE_ADMIN, User::ROLE_MEMBER])
            : [User::ROLE_MEMBER];

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:100', 'alpha_dash', 'unique:users,username'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in($allowedRoles)],
            'status' => ['required', Rule::in(['active', 'dnd', 'banned'])],
            'bio' => ['nullable', 'string', 'max:500'],
        ]);

        $member = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => trim($validated['name']),
                'username' => trim($validated['username']),
                'email' => trim($validated['email']),
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
                'status' => $validated['status'],
                'bio' => $validated['bio'] ?? null,
            ]);

            $user->syncUserRole($validated['role']);
            $this->portfolioService->createDefaultPortfolio($user);

            return $user;
        });

        $this->logService->infoLog('Users', "Created account @{$member->username} with role {$member->role}");

        return redirect()->back()->with('success', "Account \"{$member->name}\" ({$member->role}) has been created.");
    }

    public function update(Request $request, User $member): RedirectResponse
    {
        $this->rolePermissionService->ensureBootstrapped();
        $actor = $request->user();

        if (! $actor->isSuperAdmin() && ! $member->isMember() && $actor->id !== $member->id) {
            abort(403, 'Admins can only modify member accounts.');
        }

        $allSpatieRoles = Role::where('guard_name', 'web')->pluck('name')->all();
        $allowedRoles = $actor->isSuperAdmin()
            ? ($actor->id === $member->id
                ? [$member->role]
                : ($allSpatieRoles ?: [User::ROLE_SUPERADMIN, User::ROLE_ADMIN, User::ROLE_MEMBER]))
            : [$member->role === 'user' ? User::ROLE_MEMBER : $member->role];

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:100', 'alpha_dash', Rule::unique('users', 'username')->ignore($member->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($member->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', Rule::in($allowedRoles)],
            'status' => ['required', Rule::in(['active', 'dnd', 'banned'])],
            'bio' => ['nullable', 'string', 'max:500'],
        ]);

        if ($actor->id === $member->id && $validated['status'] === 'banned') {
            return redirect()->back()->withErrors([
                'status' => 'You cannot suspend your own active account.',
            ]);
        }

        $updatePayload = [
            'name' => trim($validated['name']),
            'username' => trim($validated['username']),
            'email' => trim($validated['email']),
            'role' => $validated['role'],
            'status' => $validated['status'],
            'bio' => $validated['bio'] ?? null,
        ];

        if (! empty($validated['password'])) {
            $updatePayload['password'] = Hash::make($validated['password']);
        }

        $member->update($updatePayload);
        $member->syncUserRole($validated['role']);

        if ($validated['status'] === 'banned') {
            DB::table('sessions')->where('user_id', $member->id)->delete();
        }

        Cache::forget("user:{$member->id}");
        Cache::forget("portfolio:user:{$member->id}");

        $this->logService->infoLog(
            'Users',
            "Updated account @{$member->username} (role: {$member->role}, status: {$member->status})"
        );

        return redirect()->back()->with('success', "Account \"{$member->name}\" has been updated.");
    }

    public function destroy(Request $request, User $member): RedirectResponse
    {
        $actor = $request->user();

        if ($actor->id === $member->id) {
            abort(403, 'You cannot delete your own account.');
        }

        if (! $actor->isSuperAdmin() && ! $member->isMember()) {
            abort(403, 'Admins can only delete member accounts.');
        }

        if ($member->isSuperAdmin() && User::where('role', User::ROLE_SUPERADMIN)->count() <= 1) {
            abort(422, 'Cannot delete the last Super Admin account.');
        }

        $name = $member->name;
        $username = $member->username;
        $oldPhotoToDelete = ($member->photo_path && ! str_starts_with($member->photo_path, 'http'))
            ? $member->photo_path
            : null;

        $portfolio = $member->portfolioUser()->with(['home', 'projects.images'])->first();
        $portfolioFilesToDelete = $portfolio
            ? $this->portfolioService->collectPortfolioFilePaths($portfolio)
            : [];

        DB::beginTransaction();

        try {
            if ($portfolio) {
                $this->portfolioService->deletePortfolioRecordOnly($portfolio);
            }

            DB::table('sessions')->where('user_id', $member->id)->delete();
            $member->delete();

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }

        $disk = Storage::disk('public');
        if ($oldPhotoToDelete) {
            $disk->delete($oldPhotoToDelete);
        }
        foreach ($portfolioFilesToDelete as $filePath) {
            $disk->delete($filePath);
        }

        Cache::forget("user:{$member->id}");

        $this->logService->infoLog('Users', "Deleted account @{$username}");

        return redirect()->back()->with('success', "Account \"{$name}\" has been deleted.");
    }

    public function preview(Request $request, User $member): RedirectResponse
    {
        $portfolio = $this->portfolioService->getPublicPortfolio($member->id);

        if (! $portfolio) {
            abort(404, 'This member has not initialized their portfolio yet.');
        }

        return redirect()->route('portfolio.index', ['slug' => $portfolio->slug]);
    }

    public function promoteSkill(Request $request, TechStack $techStack): RedirectResponse
    {
        $techStack->update([
            'is_global' => true,
            'user_id' => null,
        ]);

        Cache::flush();
        $this->logService->infoLog('Portfolio', "Promoted custom skill '{$techStack->name}' to global default");

        return redirect()->back()->with('success', "Skill \"{$techStack->name}\" promoted to Global Default.");
    }
}
