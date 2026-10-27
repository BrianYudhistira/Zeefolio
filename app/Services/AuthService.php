<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Authenticate user for SPA session.
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

        return $user;
    }

    /**
     * Register a new user and authenticate them into the SPA session.
     */
    public function register(array $data, ?UploadedFile $photoFile = null): User
    {
        $photoPath = null;

        if ($photoFile) {
            $filename = Str::uuid()->toString().'.'.$photoFile->getClientOriginalExtension();
            $photoPath = $photoFile->storeAs('users', $filename, 'public');
        }

        $username = $data['username'] ?? Str::slug($data['name']).'-'.Str::lower(Str::random(4));

        $user = User::create([
            'name' => $data['name'],
            'username' => $username,
            'email' => $data['email'],
            'photo_path' => $photoPath,
            'password' => Hash::make($data['password']),
        ]);

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

    /**
     * Logout user from all devices and invalidate all database sessions & tokens.
     */
    public function logoutAll(User $user): void
    {
        DB::table('sessions')->where('user_id', $user->id)->delete();

        $user->setRememberToken(Str::random(60));
        $user->save();

        $user->tokens()->delete();

        Auth::guard('web')->logout();
    }

    /**
     * Update authenticated user's profile.
     *
     * @throws ValidationException
     */
    public function updateProfile(User $user, array $data, ?UploadedFile $photoFile = null): User
    {
        if (! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['Incorrect password.'],
            ]);
        }

        if ($photoFile) {
            if ($user->photo_path) {
                Storage::disk('public')->delete($user->photo_path);
            }

            $filename = Str::uuid()->toString().'.'.$photoFile->getClientOriginalExtension();
            $data['photo_path'] = $photoFile->storeAs('users', $filename, 'public');
        }

        unset($data['password'], $data['photo']);

        $user->update($data);

        $this->clearUserCache($user->id);

        return $user->fresh();
    }

    /**
     * Delete user account and associated resources.
     */
    public function deleteAccount(User $user): void
    {
        $userId = $user->id;

        if ($user->photo_path) {
            Storage::disk('public')->delete($user->photo_path);
        }

        DB::table('sessions')->where('user_id', $userId)->delete();
        $user->tokens()->delete();
        $user->delete();

        $this->clearUserCache($userId);
    }

    /**
     * Clear user-related cache keys.
     */
    private function clearUserCache(int $userId): void
    {
        Cache::forget("user:{$userId}");
        Cache::forget("portfolio:user:{$userId}");
    }
}
