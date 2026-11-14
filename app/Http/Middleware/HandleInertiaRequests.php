<?php

namespace App\Http\Middleware;

use App\Models\Log;
use App\Models\User;
use App\Models\UserNotification;
use App\Services\LogService;
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
            $bannedUser = $request->user();
            try {
                app(LogService::class)->warningLog(
                    'Security',
                    "Force-logged out banned user @{$bannedUser->username} (ID: {$bannedUser->id})",
                    ['user_id' => $bannedUser->id]
                );
            } catch (\Throwable) {
                // Ignore logging failure during forced logout
            }

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
                'ip_address' => $user->ip_address,
                'location' => $user->location,
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
                ? $this->resolveUserNotifications($user)
                : [],
        ];
    }

    /**
     * Fetch user notifications from the dedicated `user_notifications` table.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function resolveUserNotifications(User $user): array
    {
        try {
            $logService = app(LogService::class);

            if (! UserNotification::withTrashed()->where('user_id', $user->id)->exists()) {
                $seedLogs = Log::query()
                    ->where('user_id', $user->id)
                    ->whereIn('module', ['Skills', 'Portfolio', 'Users'])
                    ->latest('id')
                    ->limit(8)
                    ->get();

                $rows = [];
                foreach ($seedLogs->reverse() as $seedLog) {
                    $timestamp = $seedLog->created_at ?? now();
                    $rows[] = [
                        'user_id' => $user->id,
                        'actor_id' => $seedLog->user_id,
                        'module' => $seedLog->module,
                        'type' => $seedLog->type ?: 'info',
                        'title' => ($seedLog->module ?: 'System') . ' Activity',
                        'message' => $seedLog->message,
                        'action_url' => $logService->resolveActionUrl($seedLog->module, (string) $seedLog->message),
                        'is_popup_hidden' => false,
                        'read_at' => null,
                        'created_at' => $timestamp,
                        'updated_at' => $timestamp,
                    ];
                }

                if (! empty($rows)) {
                    UserNotification::insert($rows);
                }
            }

            return UserNotification::with('actor:id,name,username')
                ->where('user_id', $user->id)
                ->where('is_popup_hidden', false)
                ->latest('id')
                ->limit(15)
                ->get(['id', 'user_id', 'actor_id', 'module', 'type', 'title', 'message', 'action_url', 'is_popup_hidden', 'read_at', 'created_at'])
                ->map(fn (UserNotification $n) => [
                    'id' => $n->id,
                    'user_id' => $n->user_id,
                    'actor_id' => $n->actor_id,
                    'module' => $n->module,
                    'type' => $n->type,
                    'title' => $n->title,
                    'message' => $n->message,
                    'action_url' => $n->action_url ?: $logService->resolveActionUrl($n->module, (string) $n->message),
                    'is_popup_hidden' => (bool) $n->is_popup_hidden,
                    'read_at' => $n->read_at?->toISOString(),
                    'is_read' => $n->read_at !== null,
                    'created_at' => $n->created_at?->toISOString(),
                    'user' => $n->actor ? [
                        'id' => $n->actor->id,
                        'name' => $n->actor->name,
                        'username' => $n->actor->username,
                    ] : null,
                ])
                ->values()
                ->all();
        } catch (\Throwable) {
            return [];
        }
    }
}

