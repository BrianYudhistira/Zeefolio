<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AuthService
{
    /**
     * Authenticate user for web session.
     *
     * @param  array{email: string, password: string}  $credentials
     *
     * @throws AuthenticationException
     */
    public function attemptLogin(array $credentials, bool $remember = false): User
    {
        $credentials['email'] = Str::lower(trim((string) ($credentials['email'] ?? '')));

        if (! Auth::guard('web')->attempt($credentials, $remember)) {
            throw new AuthenticationException('Invalid credentials');
        }

        /** @var User $user */
        $user = Auth::guard('web')->user();

        if ($user->status === 'banned') {
            Auth::guard('web')->logout();
            throw new AuthenticationException('Your account has been suspended.');
        }

        $ipAddress = request()->ip();
        $user->forceFill([
            'last_login_at' => now(),
            'ip_address' => $ipAddress,
            'location' => app(LogService::class)->resolveClientLocation($ipAddress),
        ])->save();

        return $user;
    }

    /**
     * Register a new user and authenticate them into the web session.
     */
    public function register(array $data, ?UploadedFile $photo = null): User
    {
        $photoPath = null;

        DB::beginTransaction();

        try {
            $baseUsername = ! empty($data['username'])
                ? Str::slug($data['username'], '_')
                : (Str::slug($data['name']) ?: 'user');

            $username = $baseUsername;
            while (User::where('username', $username)->exists()) {
                $username = $baseUsername.'_'.Str::lower(Str::random(4));
            }

            if ($photo instanceof UploadedFile) {
                $photoPath = $photo->store('users/photos', 'public');
                if (! $photoPath) {
                    throw new \RuntimeException('Failed to store uploaded profile photo.');
                }
            }

            $ipAddress = request()->ip();
            $user = User::create([
                'name' => trim($data['name']),
                'username' => $username,
                'email' => Str::lower(trim((string) $data['email'])),
                'photo_path' => $photoPath,
                'role' => User::ROLE_MEMBER,
                'status' => 'active',
                'last_login_at' => now(),
                'ip_address' => $ipAddress,
                'location' => app(LogService::class)->resolveClientLocation($ipAddress),
                'password' => Hash::make($data['password']),
            ]);

            app(RolePermissionService::class)->ensureBootstrapped();
            $user->syncUserRole(User::ROLE_MEMBER);

            // SEC-11: Initialize default portfolio during registration instead of mutating state on GET requests
            app(PortfolioService::class)->createDefaultPortfolio($user);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            if ($photoPath) {
                Storage::disk('public')->delete($photoPath);
            }
            throw $e;
        }

        Auth::guard('web')->login($user);

        return $user;
    }

    /**
     * Logout user from current session.
     */
    public function logout(): void
    {
        Auth::guard('web')->logout();
    }
}
