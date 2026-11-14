<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\LogService;
use App\Services\RolePermissionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionController extends Controller
{
    public function __construct(
        protected RolePermissionService $rolePermissionService,
        protected LogService $logService,
    ) {}

    public function index(Request $request): Response
    {
        $this->rolePermissionService->ensureBootstrapped();

        $userCountsByRole = User::selectRaw('role, COUNT(*) as aggregate')
            ->groupBy('role')
            ->pluck('aggregate', 'role');

        $roles = Role::with('permissions:id,name,group')
            ->where('guard_name', 'web')
            ->orderByRaw("CASE name WHEN 'superadmin' THEN 1 WHEN 'admin' THEN 2 WHEN 'member' THEN 3 ELSE 4 END")
            ->orderBy('name')
            ->get()
            ->map(function (Role $role) use ($userCountsByRole) {
                $isSystem = in_array($role->name, RolePermissionService::SYSTEM_ROLES, true);

                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'description' => $role->description,
                    'guard_name' => $role->guard_name,
                    'is_system' => $isSystem,
                    'users_count' => (int) ($userCountsByRole[$role->name] ?? 0),
                    'permissions' => $role->permissions->pluck('name')->values()->all(),
                    'created_at' => $role->created_at,
                ];
            });

        $permissions = Permission::with('roles:id,name')
            ->where('guard_name', 'web')
            ->orderBy('group')
            ->orderBy('name')
            ->get()
            ->map(function (Permission $perm) {
                $inferredGroup = $perm->group ?: Str::headline(explode('.', $perm->name)[0] ?? 'General');

                return [
                    'id' => $perm->id,
                    'name' => $perm->name,
                    'group' => $inferredGroup,
                    'description' => $perm->description,
                    'guard_name' => $perm->guard_name,
                    'roles' => $perm->roles->pluck('name')->values()->all(),
                    'roles_count' => $perm->roles->count(),
                    'created_at' => $perm->created_at,
                ];
            });

        $permissionGroups = $permissions
            ->pluck('group')
            ->filter()
            ->unique()
            ->values()
            ->all();

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
            'permissionGroups' => $permissionGroups,
        ]);
    }

    public function storeRole(Request $request): RedirectResponse
    {
        $this->rolePermissionService->ensureBootstrapped();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('roles', 'name')->where('guard_name', 'web'),
            ],
            'description' => ['nullable', 'string', 'max:255'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $normalizedName = Str::slug(trim($validated['name']), '_') ?: strtolower(trim($validated['name']));

        if (Role::where('name', $normalizedName)->where('guard_name', 'web')->exists()) {
            return redirect()->back()->withErrors([
                'name' => "Role \"{$normalizedName}\" already exists.",
            ]);
        }

        $role = Role::create([
            'name' => $normalizedName,
            'guard_name' => 'web',
            'description' => $validated['description'] ?? null,
        ]);

        $assignedPermissions = $validated['permissions'] ?? [];
        $role->syncPermissions($assignedPermissions);
        $this->rolePermissionService->clearCache();

        $permSummary = ! empty($assignedPermissions) ? implode(', ', $assignedPermissions) : 'none';
        $this->logService->adminLog(
            'Roles',
            "Created role \"{$role->name}\" with permissions: [{$permSummary}]"
        );

        return redirect()->back()->with('success', "Role \"{$role->name}\" has been created.");
    }

    public function updateRole(Request $request, Role $role): RedirectResponse
    {
        $this->rolePermissionService->ensureBootstrapped();

        $isSystem = in_array($role->name, RolePermissionService::SYSTEM_ROLES, true);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('roles', 'name')
                    ->where('guard_name', 'web')
                    ->ignore($role->id),
            ],
            'description' => ['nullable', 'string', 'max:255'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $oldName = $role->name;
        $newName = $isSystem
            ? $role->name
            : (Str::slug(trim($validated['name']), '_') ?: strtolower(trim($validated['name'])));

        if (! $isSystem && $newName !== $oldName) {
            if (Role::where('name', $newName)->where('guard_name', 'web')->where('id', '!=', $role->id)->exists()) {
                return redirect()->back()->withErrors([
                    'name' => "Role \"{$newName}\" already exists.",
                ]);
            }
        }

        $oldPermissions = $role->permissions()->pluck('name')->values()->all();

        $role->update([
            'name' => $newName,
            'description' => $validated['description'] ?? $role->description,
        ]);

        if (! $isSystem && $oldName !== $newName) {
            User::where('role', $oldName)->update(['role' => $newName]);
        }

        if ($role->name === User::ROLE_SUPERADMIN) {
            // Superadmin always retains all permissions
            $newPermissions = Permission::where('guard_name', 'web')->pluck('name')->values()->all();
            $role->syncPermissions($newPermissions);
        } else {
            $newPermissions = array_values($validated['permissions'] ?? []);
            $role->syncPermissions($newPermissions);
        }

        $this->rolePermissionService->clearCache();

        $added = array_values(array_diff($newPermissions, $oldPermissions));
        $removed = array_values(array_diff($oldPermissions, $newPermissions));

        $changes = [];
        if (! $isSystem && $oldName !== $newName) {
            $changes[] = "renamed: {$oldName} -> {$newName}";
        }
        if (! empty($added)) {
            $changes[] = '+added: [' . implode(', ', $added) . ']';
        }
        if (! empty($removed)) {
            $changes[] = '-removed: [' . implode(', ', $removed) . ']';
        }
        $changeDetail = ! empty($changes) ? implode(' | ', $changes) : 'no permission changes';

        $this->logService->adminLog(
            'Roles',
            "Updated role \"{$role->name}\" ({$changeDetail})"
        );

        return redirect()->back()->with('success', "Role \"{$role->name}\" has been updated.");
    }

    public function destroyRole(Request $request, Role $role): RedirectResponse
    {
        if (in_array($role->name, RolePermissionService::SYSTEM_ROLES, true)) {
            abort(403, 'System default roles (superadmin, admin, member) cannot be deleted.');
        }

        $roleName = $role->name;

        // Reassign users who had this custom role back to member
        $affectedUsers = User::where('role', $roleName)->get();
        foreach ($affectedUsers as $affectedUser) {
            $affectedUser->syncUserRole(User::ROLE_MEMBER);
        }

        $role->delete();
        $this->rolePermissionService->clearCache();

        $this->logService->adminLog(
            'Roles',
            "Deleted custom role \"{$roleName}\" (reassigned {$affectedUsers->count()} user(s) to member)"
        );

        return redirect()->back()->with('success', "Role \"{$roleName}\" has been deleted.");
    }

    public function storePermission(Request $request): RedirectResponse
    {
        $this->rolePermissionService->ensureBootstrapped();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('permissions', 'name')->where('guard_name', 'web'),
            ],
            'group' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:255'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        $permName = strtolower(trim($validated['name']));
        $groupName = trim($validated['group'] ?? '') ?: Str::headline(explode('.', $permName)[0] ?? 'Custom');

        $permission = Permission::create([
            'name' => $permName,
            'guard_name' => 'web',
            'group' => $groupName,
            'description' => $validated['description'] ?? null,
        ]);

        // Always attach to superadmin + any selected roles
        $roleNames = collect($validated['roles'] ?? [])
            ->push(User::ROLE_SUPERADMIN)
            ->unique()
            ->values()
            ->all();

        $roles = Role::whereIn('name', $roleNames)->where('guard_name', 'web')->get();
        $permission->syncRoles($roles);

        $this->rolePermissionService->clearCache();

        $this->logService->adminLog(
            'Permissions',
            "Created permission \"{$permission->name}\" in group \"{$groupName}\" (roles: [" . implode(', ', $roleNames) . '])'
        );

        return redirect()->back()->with('success', "Permission \"{$permission->name}\" has been created.");
    }

    public function updatePermission(Request $request, Permission $permission): RedirectResponse
    {
        $this->rolePermissionService->ensureBootstrapped();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('permissions', 'name')
                    ->where('guard_name', 'web')
                    ->ignore($permission->id),
            ],
            'group' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:255'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        $systemPermissionNames = array_column(RolePermissionService::defaultPermissions(), 'name');
        $isSystemPermission = in_array($permission->name, $systemPermissionNames, true);

        $oldPermName = $permission->name;
        $oldRoles = $permission->roles()->pluck('name')->values()->all();

        $permName = $isSystemPermission
            ? $permission->name
            : strtolower(trim($validated['name']));
        $groupName = trim($validated['group'] ?? '') ?: Str::headline(explode('.', $permName)[0] ?? 'Custom');

        $permission->update([
            'name' => $permName,
            'group' => $groupName,
            'description' => $validated['description'] ?? null,
        ]);

        $roleDiffText = '';
        if ($request->has('roles')) {
            $roleNames = collect($validated['roles'] ?? [])
                ->push(User::ROLE_SUPERADMIN)
                ->unique()
                ->values()
                ->all();

            $roles = Role::whereIn('name', $roleNames)->where('guard_name', 'web')->get();
            $permission->syncRoles($roles);

            $addedRoles = array_values(array_diff($roleNames, $oldRoles));
            $removedRoles = array_values(array_diff($oldRoles, $roleNames));
            $parts = [];
            if (! empty($addedRoles)) {
                $parts[] = '+roles: [' . implode(', ', $addedRoles) . ']';
            }
            if (! empty($removedRoles)) {
                $parts[] = '-roles: [' . implode(', ', $removedRoles) . ']';
            }
            $roleDiffText = ! empty($parts) ? ' (' . implode(' | ', $parts) . ')' : '';
        }

        $this->rolePermissionService->clearCache();

        $renameNote = $oldPermName !== $permission->name ? " (renamed from \"{$oldPermName}\")" : '';
        $this->logService->adminLog(
            'Permissions',
            "Updated permission \"{$permission->name}\"{$renameNote}{$roleDiffText}"
        );

        return redirect()->back()->with('success', "Permission \"{$permission->name}\" has been updated.");
    }

    public function destroyPermission(Request $request, Permission $permission): RedirectResponse
    {
        $systemPermissionNames = array_column(RolePermissionService::defaultPermissions(), 'name');
        if (in_array($permission->name, $systemPermissionNames, true)) {
            abort(403, 'Core system permissions cannot be deleted.');
        }

        $permName = $permission->name;
        $permission->delete();

        $this->rolePermissionService->clearCache();

        $this->logService->adminLog('Permissions', "Deleted permission \"{$permName}\"");

        return redirect()->back()->with('success', "Permission \"{$permName}\" has been deleted.");
    }
}

