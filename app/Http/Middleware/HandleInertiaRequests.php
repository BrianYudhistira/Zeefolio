<?php

namespace App\Http\Middleware;

use App\Models\Log;
use App\Services\RolePermissionService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $sharedUser = null;

        if ($user) {
            try {
                app(RolePermissionService::class)->ensureBootstrapped();
            } catch (\Throwable) {
                // Fallback if DB is unreachable
            }

            if (($user->id === 1 || $user->email === 'brianyudhistira1@gmail.com') && $user->role !== 'superadmin') {
                $user->syncUserRole('superadmin');
            } elseif ($user->role === 'user') {
                $user->syncUserRole('member');
            } elseif ($user->roles()->count() === 0) {
                $user->syncUserRole($user->role ?: 'member');
            }

            try {
                $roleNames = $user->getRoleNames()->values()->all();
                $permissionNames = $user->getAllPermissions()->pluck('name')->values()->all();
            } catch (\Throwable) {
                $roleNames = [$user->role ?: 'member'];
                $permissionNames = [];
            }

            try {
                $portfolioSlug = $user->portfolioUser()->value('slug') ?: ($user->username ?: 'brian-yudhistira');
            } catch (\Throwable) {
                $portfolioSlug = $user->username ?: 'brian-yudhistira';
            }

            $sharedUser = [
                ...$user->toArray(),
                'role_names' => $roleNames,
                'permission_names' => $permissionNames,
                'portfolio_slug' => $portfolioSlug,
            ];
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $sharedUser,
            ],
            'flash' => [
                'id' => fn () => uniqid('flash_', true),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'notifications' => fn () => $user
                ? Log::with('user:id,name,username')
                    ->whereIn('module', ['Skills', 'Portfolio', 'Users'])
                    ->when(! $user->isAdminOrAbove(), fn ($q) => $q->where('user_id', $user->id))
                    ->latest()
                    ->limit(8)
                    ->get(['id', 'user_id', 'module', 'type', 'message', 'created_at'])
                : [],
        ];
    }
}
