<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\AuthService;
use App\Services\LogService;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService,
        protected LogService $logService,
    ) {}

    public function loginView(): Response
    {
        return Inertia::render('Admin/Auth/Login');
    }

    public function registerView(): Response
    {
        return Inertia::render('Admin/Auth/Register');
    }

    public function login(LoginRequest $request): RedirectResponse
    {
        $credentials = $request->safe()->only(['email', 'password']);
        $remember = $request->boolean('remember');

        try {
            $this->authService->attemptLogin($credentials, $remember);

            if ($request->hasSession()) {
                $request->session()->regenerate();
            }

            $this->logService->infoLog(
                'Auth',
                $remember ? 'Success: Admin logged in with remember me' : 'Success: Admin logged in',
            );

            return redirect()->intended(route('admin.dashboard'));
        } catch (AuthenticationException $e) {
            $this->logService->warningLog(
                'Auth',
                'Failed admin login attempt for email: '.$credentials['email'],
            );

            return back()
                ->withErrors(['email' => 'Invalid email or password.'])
                ->onlyInput('email');
        }
    }

    public function register(RegisterRequest $request): RedirectResponse
    {
        $this->authService->register(
            $request->safe()->except(['photo']),
            $request->file('photo'),
        );

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        $this->logService->infoLog('Auth', 'Success: New admin user registered');

        return redirect()->route('admin.dashboard');
    }

    public function logout(Request $request): RedirectResponse
    {
        if ($request->user()) {
            $this->logService->infoLog('Auth', 'Success: Admin user logged out');
        }

        $this->authService->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return redirect()->route('admin.login');
    }
}