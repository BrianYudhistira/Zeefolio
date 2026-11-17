<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionService
{
    public const CACHE_KEY = 'zeefolio_spatie_rbac_initialized_v2';

    /**
     * System-protected core roles that cannot be deleted or renamed.
     */
    public const SYSTEM_ROLES = [
        User::ROLE_SUPERADMIN,
        User::ROLE_ADMIN,
        User::ROLE_MEMBER,
    ];

    /**
     * Default permissions grouped by module.
     *
     * @return array<int, array{name: string, group: string, description: string}>
     */
    public static function defaultPermissions(): array
    {
        return [
            // Portfolio Content
            [
                'name' => 'dashboard.view',
                'group' => 'Portfolio',
                'description' => 'Access dashboard overview and portfolio views analytics.',
            ],
            [
                'name' => 'home.manage',
                'group' => 'Portfolio',
                'description' => 'Manage home hero section, profile bio, and public availability.',
            ],
            [
                'name' => 'projects.manage',
                'group' => 'Portfolio',
                'description' => 'Create, update, and delete portfolio projects and custom categories.',
            ],
            [
                'name' => 'skills.manage',
                'group' => 'Portfolio',
                'description' => 'Manage portfolio skills and skill display categories.',
            ],
            [
                'name' => 'experiences.manage',
                'group' => 'Portfolio',
                'description' => 'Create, update, reorder, and delete work experiences.',
            ],
            [
                'name' => 'tech-stacks.manage',
                'group' => 'Portfolio',
                'description' => 'Manage custom tech stack items for portfolio.',
            ],
            [
                'name' => 'contacts.manage',
                'group' => 'Portfolio',
                'description' => 'Manage portfolio contact details and social channels.',
            ],

            // Administration
            [
                'name' => 'members.view',
                'group' => 'Administration',
                'description' => 'View member accounts, portfolios, and activity status.',
            ],
            [
                'name' => 'members.create',
                'group' => 'Administration',
                'description' => 'Create new member accounts and initialize their portfolios.',
            ],
            [
                'name' => 'members.edit',
                'group' => 'Administration',
                'description' => 'Edit member accounts, roles, ban status, and switch into member portfolios.',
            ],
            [
                'name' => 'members.delete',
                'group' => 'Administration',
                'description' => 'Delete member accounts and associated portfolio data.',
            ],
            [
                'name' => 'skills.promote',
                'group' => 'Administration',
                'description' => 'Promote member custom skills to the global skill catalog.',
            ],
            [
                'name' => 'logs.view',
                'group' => 'Administration',
                'description' => 'View activity logs, security events, and admin access audit trail.',
            ],
            [
                'name' => 'settings.manage',
                'group' => 'Administration',
                'description' => 'Manage global skills, skill categories, and global project categories.',
            ],

            // Access Control (RBAC)
            [
                'name' => 'roles.manage',
                'group' => 'Access Control',
                'description' => 'Create, edit, and delete roles and assign role permissions.',
            ],
            [
                'name' => 'permissions.manage',
                'group' => 'Access Control',
                'description' => 'Create, edit, and delete permissions directly from the dashboard.',
            ],
        ];
    }

    /**
     * Ensure default permissions, default roles, and existing user role assignments exist.
     */
    public function ensureBootstrapped(): void
    {
        if (Cache::get(self::CACHE_KEY)) {
            return;
        }

        $this->seedDefaults();
        $this->syncExistingUsers();

        Cache::forever(self::CACHE_KEY, true);
    }

    /**
     * Clear Spatie's internal permission cache without triggering full schema/user resync.
     */
    public function clearCache(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    protected function seedDefaults(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (self::defaultPermissions() as $permData) {
            $perm = Permission::firstOrCreate(
                ['name' => $permData['name'], 'guard_name' => 'web'],
                [
                    'group' => $permData['group'],
                    'description' => $permData['description'],
                ]
            );

            if (! $perm->group || ! $perm->description) {
                $perm->update([
                    'group' => $perm->group ?: $permData['group'],
                    'description' => $perm->description ?: $permData['description'],
                ]);
            }
        }

        $superAdminRole = Role::firstOrCreate(
            ['name' => User::ROLE_SUPERADMIN, 'guard_name' => 'web'],
            ['description' => 'Full platform access, role & permission management, and system administration.']
        );

        $adminRole = Role::firstOrCreate(
            ['name' => User::ROLE_ADMIN, 'guard_name' => 'web'],
            ['description' => 'Manage member accounts, member portfolios, global skills, and categories.']
        );

        $memberRole = Role::firstOrCreate(
            ['name' => User::ROLE_MEMBER, 'guard_name' => 'web'],
            ['description' => 'Standard member role to manage personal portfolio content.']
        );

        // Superadmin gets all permissions
        $superAdminRole->syncPermissions(Permission::where('guard_name', 'web')->get());

        // Seed default permissions for admin & member only if they currently have 0 permissions assigned
        if ($adminRole->permissions()->count() === 0) {
            $adminRole->syncPermissions([
                'dashboard.view',
                'home.manage',
                'projects.manage',
                'skills.manage',
                'experiences.manage',
                'tech-stacks.manage',
                'contacts.manage',
                'members.view',
                'members.create',
                'members.edit',
                'members.delete',
                'skills.promote',
                'logs.view',
                'settings.manage',
            ]);
        }

        if ($memberRole->permissions()->count() === 0) {
            $memberRole->syncPermissions([
                'dashboard.view',
                'home.manage',
                'projects.manage',
                'skills.manage',
                'experiences.manage',
                'tech-stacks.manage',
                'contacts.manage',
            ]);
        }

        // Backfill split per-menu permissions for existing v1 roles that already have permissions
        foreach ([$adminRole, $memberRole] as $role) {
            $role->load('permissions');
            if ($role->permissions->isNotEmpty()) {
                if ($role->permissions->contains('name', 'profile.manage')) {
                    $role->givePermissionTo(['home.manage', 'contacts.manage']);
                }
                if ($role->permissions->contains('name', 'skills.manage') && ! $role->permissions->contains('name', 'tech-stacks.manage')) {
                    $role->givePermissionTo('tech-stacks.manage');
                }
            }
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function syncExistingUsers(): void
    {
        User::where('role', 'user')->update(['role' => User::ROLE_MEMBER]);

        $existingRoles = Role::where('guard_name', 'web')->pluck('id', 'name')->all();
        $users = User::with('roles')->get();

        foreach ($users as $user) {
            $roleName = $user->role ?: User::ROLE_MEMBER;

            if (! isset($existingRoles[$roleName])) {
                $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
                $existingRoles[$roleName] = $role->id;
            }

            if ($user->roles->isEmpty() || ! $user->roles->contains('name', $roleName)) {
                $user->syncRoles([$roleName]);
            }
        }
    }
}

