<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionService
{
    public const CACHE_KEY = 'zeefolio_spatie_rbac_initialized_v1';

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
                'name' => 'profile.manage',
                'group' => 'Portfolio',
                'description' => 'Manage home hero section, profile bio, and contact details.',
            ],
            [
                'name' => 'projects.manage',
                'group' => 'Portfolio',
                'description' => 'Create, update, and delete portfolio projects and custom categories.',
            ],
            [
                'name' => 'skills.manage',
                'group' => 'Portfolio',
                'description' => 'Manage portfolio skills and custom tech stack items.',
            ],
            [
                'name' => 'experiences.manage',
                'group' => 'Portfolio',
                'description' => 'Create, update, reorder, and delete work experiences.',
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
                'description' => 'Edit member accounts and switch into member portfolios.',
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

    protected function ensureTablesExist(): void
    {
        $tableNames = config('permission.table_names');
        $columnNames = config('permission.column_names');
        $pivotRole = $columnNames['role_pivot_key'] ?? 'role_id';
        $pivotPermission = $columnNames['permission_pivot_key'] ?? 'permission_id';

        if (! Schema::hasTable($tableNames['permissions'])) {
            Schema::create($tableNames['permissions'], static function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('name');
                $table->string('guard_name')->default('web');
                $table->string('group', 50)->nullable();
                $table->string('description', 255)->nullable();
                $table->timestamps();

                $table->unique(['name', 'guard_name']);
            });
        } else {
            if (! Schema::hasColumn($tableNames['permissions'], 'group')) {
                Schema::table($tableNames['permissions'], static function (Blueprint $table) {
                    $table->string('group', 50)->nullable()->after('guard_name');
                });
            }
            if (! Schema::hasColumn($tableNames['permissions'], 'description')) {
                Schema::table($tableNames['permissions'], static function (Blueprint $table) {
                    $table->string('description', 255)->nullable()->after('group');
                });
            }
        }

        if (! Schema::hasTable($tableNames['roles'])) {
            Schema::create($tableNames['roles'], static function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('name');
                $table->string('guard_name')->default('web');
                $table->string('description', 255)->nullable();
                $table->timestamps();

                $table->unique(['name', 'guard_name']);
            });
        } elseif (! Schema::hasColumn($tableNames['roles'], 'description')) {
            Schema::table($tableNames['roles'], static function (Blueprint $table) {
                $table->string('description', 255)->nullable()->after('guard_name');
            });
        }

        if (! Schema::hasTable($tableNames['model_has_permissions'])) {
            Schema::create($tableNames['model_has_permissions'], static function (Blueprint $table) use ($tableNames, $columnNames, $pivotPermission) {
                $table->unsignedBigInteger($pivotPermission);
                $table->string('model_type');
                $table->unsignedBigInteger($columnNames['model_morph_key']);
                $table->index([$columnNames['model_morph_key'], 'model_type'], 'model_has_permissions_model_id_model_type_index');

                $table->foreign($pivotPermission)
                    ->references('id')
                    ->on($tableNames['permissions'])
                    ->onDelete('cascade');

                $table->primary(
                    [$pivotPermission, $columnNames['model_morph_key'], 'model_type'],
                    'model_has_permissions_permission_model_type_primary'
                );
            });
        }

        if (! Schema::hasTable($tableNames['model_has_roles'])) {
            Schema::create($tableNames['model_has_roles'], static function (Blueprint $table) use ($tableNames, $columnNames, $pivotRole) {
                $table->unsignedBigInteger($pivotRole);
                $table->string('model_type');
                $table->unsignedBigInteger($columnNames['model_morph_key']);
                $table->index([$columnNames['model_morph_key'], 'model_type'], 'model_has_roles_model_id_model_type_index');

                $table->foreign($pivotRole)
                    ->references('id')
                    ->on($tableNames['roles'])
                    ->onDelete('cascade');

                $table->primary(
                    [$pivotRole, $columnNames['model_morph_key'], 'model_type'],
                    'model_has_roles_role_model_type_primary'
                );
            });
        }

        if (! Schema::hasTable($tableNames['role_has_permissions'])) {
            Schema::create($tableNames['role_has_permissions'], static function (Blueprint $table) use ($tableNames, $pivotRole, $pivotPermission) {
                $table->unsignedBigInteger($pivotPermission);
                $table->unsignedBigInteger($pivotRole);

                $table->foreign($pivotPermission)
                    ->references('id')
                    ->on($tableNames['permissions'])
                    ->onDelete('cascade');

                $table->foreign($pivotRole)
                    ->references('id')
                    ->on($tableNames['roles'])
                    ->onDelete('cascade');

                $table->primary([$pivotPermission, $pivotRole], 'role_has_permissions_permission_id_role_id_primary');
            });
        }
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
                'profile.manage',
                'projects.manage',
                'skills.manage',
                'experiences.manage',
                'members.view',
                'members.create',
                'members.edit',
                'members.delete',
                'skills.promote',
                'settings.manage',
            ]);
        }

        if ($memberRole->permissions()->count() === 0) {
            $memberRole->syncPermissions([
                'dashboard.view',
                'profile.manage',
                'projects.manage',
                'skills.manage',
                'experiences.manage',
            ]);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function syncExistingUsers(): void
    {
        User::where('role', 'user')->update(['role' => User::ROLE_MEMBER]);

        $users = User::with('roles')->get();
        foreach ($users as $user) {
            $roleName = $user->role ?: User::ROLE_MEMBER;

            // Ensure the role exists in Spatie roles table
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);

            if ($user->roles->isEmpty() || ! $user->hasRole($roleName)) {
                $user->syncRoles([$roleName]);
            }
        }
    }
}

