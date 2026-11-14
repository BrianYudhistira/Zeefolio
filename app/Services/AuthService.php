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
        if (! Auth::guard('web')->attempt($credentials, $remember)) {
            throw new AuthenticationException('Invalid credentials');
        }

        /** @var User $user */
        $user = Auth::guard('web')->user();

        if ($user->status === 'banned') {
            Auth::guard('web')->logout();
            throw new AuthenticationException('Your account has been suspended.');
        }

        return $user;
    }

    /**
     * Register a new user and authenticate them into the web session.
     */
    public function register(array $data, ?UploadedFile $photoFile = null): User
    {
        $disk = Storage::disk('public');
        $photoPath = null;

        DB::beginTransaction();

        try {
            if ($photoFile) {
                // SEC-08: Use server-detected MIME extension via store() instead of getClientOriginalExtension()
                $photoPath = $photoFile->store('users/photos', 'public');
            }

            $baseUsername = ! empty($data['username'])
                ? Str::slug($data['username'], '_')
                : (Str::slug($data['name']) ?: 'user');

            $username = $baseUsername;
            while (User::where('username', $username)->exists()) {
                $username = $baseUsername.'_'.Str::lower(Str::random(4));
            }

            $user = User::create([
                'name' => trim($data['name']),
                'username' => $username,
                'email' => trim($data['email']),
                'photo_path' => $photoPath,
                'role' => User::ROLE_MEMBER,
                'status' => 'active',
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
                $disk->delete($photoPath);
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
