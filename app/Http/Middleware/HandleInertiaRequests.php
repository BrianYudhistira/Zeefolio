<?php

namespace App\Http\Middleware;

use App\Models\Log;
use App\Models\User;
use App\Services\PortfolioService;
use App\Services\RolePermissionService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;
use Symfony\Component\HttpFoundation\Response;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Handle the incoming request and enforce active account status (SEC-03).
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->status === 'banned') {
            Auth::guard('web')->logout();

            if ($request->hasSession()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            return redirect()->route('admin.login')->withErrors([
                'email' => 'Your account has been suspended. Please contact an administrator.',
            ]);
        }

        return parent::handle($request, $next);
    }

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

            try {
                $user->loadMissing('roles.permissions', 'permissions');

                if ($user->role === 'user') {
                    $user->syncUserRole(User::ROLE_MEMBER);
                    $user->load('roles.permissions');
                } elseif ($user->roles->isEmpty()) {
                    $user->syncUserRole($user->role ?: User::ROLE_MEMBER);
                    $user->load('roles.permissions');
                }

                $roleNames = $user->roles->pluck('name')->values()->all();
                $permissionNames = $user->getAllPermissions()->pluck('name')->values()->all();
            } catch (\Throwable) {
                $roleNames = [$user->role ?: User::ROLE_MEMBER];
                $permissionNames = [];
            }

            try {
                $portfolioSlug = app(PortfolioService::class)->getUserPortfolioSlug($user);
            } catch (\Throwable) {
                $portfolioSlug = $user->username ?: 'brian-yudhistira';
            }

            $sharedUser = [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'bio' => $user->bio,
                'photo_path' => $user->photo_path,
                'photo_url' => $user->photo_url,
                'email_verified_at' => $user->email_verified_at,
                'last_login_at' => $user->last_login_at,
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

