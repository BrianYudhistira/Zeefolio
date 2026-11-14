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
                $filename = Str::uuid()->toString().'.'.$photoFile->getClientOriginalExtension();
                $photoPath = $photoFile->storeAs('users', $filename, 'public');
            }

            $username = $data['username'] ?? Str::slug($data['name']).'-'.Str::lower(Str::random(4));

            $user = User::create([
                'name' => $data['name'],
                'username' => $username,
                'email' => $data['email'],
                'photo_path' => $photoPath,
                'role' => User::ROLE_MEMBER,
                'status' => 'active',
                'password' => Hash::make($data['password']),
            ]);

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
