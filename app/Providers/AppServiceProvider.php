<?php

namespace App\Providers;

use App\Models\User;
use App\Services\RolePermissionService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->isProduction()) {
            URL::forceScheme('https');
        }

        Vite::prefetch(concurrency: 3);

        // Superadmin implicitly passes all Gate / Spatie permission checks
        Gate::before(function (User $user, string $ability) {
            if ($user->role === User::ROLE_SUPERADMIN) {
                return true;
            }

            try {
                app(RolePermissionService::class)->ensureBootstrapped();
            } catch (\Throwable) {
                // Ignore if database is not yet available
            }

            return $user->isSuperAdmin() ? true : null;
        });
    }
}
