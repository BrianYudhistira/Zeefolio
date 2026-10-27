<?php

namespace App\Http\Controllers\API;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Services\AuthService;
use App\Services\LogService;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService,
        protected LogService $logService,
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        return $this->handleLogin($request, remember: false);
    }

    public function rememberedLogin(LoginRequest $request): JsonResponse
    {
        return $this->handleLogin($request, remember: true);
    }

    public function signin(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register(
            $request->safe()->except(['photo']),
            $request->file('photo'),
        );

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        $this->logService->infoLog('Auth', 'Success: New user registered');

        return ResponseHelper::success('User registered successfully', ['user' => $user], 201);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            $this->logService->warningLog('Auth', 'Logout attempted without authentication');

            return ResponseHelper::error('Unauthenticated', null, 401);
        }

        $this->logService->infoLog('Auth', 'Success: User logged out');

        $this->authService->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return ResponseHelper::success('Logged out successfully');
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            $this->logService->warningLog('Auth', 'Logout all attempted without authentication');

            return ResponseHelper::error('Unauthenticated', null, 401);
        }

        $this->logService->infoLog('Auth', 'Success: User logged out from all devices');

        $this->authService->logoutAll($user);

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return ResponseHelper::success('Logged out from all devices successfully');
    }

    public function editUser(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return ResponseHelper::error('Unauthenticated', null, 401);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('users', 'name')->ignore($user->id)],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'username' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user->id)],
            'bio' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'status' => ['sometimes', 'nullable', 'string', Rule::in(['active', 'dnd', 'banned'])],
            'password' => ['required', 'string'],
            'photo' => ['sometimes', 'nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
        ]);

        $updatedUser = $this->authService->updateProfile(
            $user,
            $validated,
            $request->file('photo'),
        );

        $this->logService->infoLog('Auth', 'Success: User profile updated');

        return ResponseHelper::success('User updated successfully', ['user' => $updatedUser]);
    }

    public function dropUser(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return ResponseHelper::error('Unauthenticated', null, 401);
        }

        $this->logService->infoLog('Auth', "Success: User account ({$user->email}) deleted");

        $this->authService->deleteAccount($user);

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return ResponseHelper::success('User account deleted successfully');
    }

    public function deleteUserById(Request $request, int $id): JsonResponse
    {
        $auth = $request->user();

        if (! $auth) {
            return ResponseHelper::error('Unauthenticated', null, 401);
        }

        if ($auth->role !== 'admin') {
            $this->logService->warningLog('Auth', "Forbidden user deletion attempt by user ID: {$auth->id}");

            return ResponseHelper::error('Forbidden', null, 403);
        }

        $targetUser = User::find($id);

        if (! $targetUser) {
            return ResponseHelper::error('User not found', null, 404);
        }

        $this->authService->deleteAccount($targetUser);
        $this->logService->infoLog('Auth', "Admin deleted user ID: {$id}");

        return ResponseHelper::success('User deleted successfully');
    }

    private function handleLogin(LoginRequest $request, bool $remember): JsonResponse
    {
        $credentials = $request->safe()->only(['email', 'password']);

        try {
            $user = $this->authService->attemptLogin($credentials, $remember);

            if ($request->hasSession()) {
                $request->session()->regenerate();
            }

            $this->logService->infoLog(
                'Auth',
                $remember ? 'Success: User logged in with remember me' : 'Success: User logged in',
            );

            return ResponseHelper::success('Login successful', ['user' => $user]);
        } catch (AuthenticationException $e) {
            $this->logService->warningLog(
                'Auth',
                ($remember ? 'Failed remembered login attempt for email: ' : 'Failed login attempt for email: ').$credentials['email'],
            );

            $prefix = $remember ? 'Remembered login error: ' : 'Login error: ';

            return ResponseHelper::error($prefix.$e->getMessage(), null, 401);
        }
    }
}
