<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Services\LogService;
use App\Helpers\ResponseHelper;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    protected $logService;

    public function __construct(LogService $logService)
    {
        $this->logService = $logService;
    }

    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|string|email',
                'password' => 'required|string',
            ]);

            if (!Auth::attempt($validated, false)) {
                $this->logService->warningLog(
                    'Auth',
                    'Failed login attempt for email: ' . $validated['email']
                );
                throw new \Exception('Invalid credentials', 401);
            }

            $request->session()->regenerate();

            $user = User::where('email', $validated['email'])->firstOrFail();

            $this->logService->infoLog(
                'Auth',
                'Success: User logged in'
            );

            return ResponseHelper::success('Login successful', ['user'=> $user]);

        } catch (\Exception $e) {
            $this->logService->errorLog(
                'Auth',
                'Login error: ' . $e->getMessage()
            );
            return ResponseHelper::error('Login error: ' . $e->getMessage(), null, 401);
        }
    }

    public function rememberedLogin(Request $request)
    {
        try{
            $validated = $request->validate([
                'email' => 'required|string|email',
                'password' => 'required|string',
            ]);

            if(!Auth::attempt($validated, true)) {
                $this->logService->warningLog(
                    'Auth',
                    'Failed remembered login attempt for email: ' . $validated['email']
                );
                throw new \Exception('Invalid credentials', 401);
            }

            $request->session()->regenerate();

            $user = User::where('email', $validated['email'])->firstOrFail();

            $this->logService->infoLog(
                'Auth',
                'Success: User logged in with remember me'
            );
            return ResponseHelper::success('Login successful', ['user'=> $user]);
        } catch(\Exception $e) {
            $this->logService->errorLog(
                'Auth',
                'Remembered login error: ' . $e->getMessage()
            );
            return ResponseHelper::error('Remembered login error: ' . $e->getMessage(), null, 401);
        }
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            $this->logService->warningLog('Auth', 'Logout attempted without authentication');
            return ResponseHelper::error('Unauthenticated', null, 401);
        }

        $this->logService->infoLog(
            'Auth',
            'Success: User logged out'
        );

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return ResponseHelper::success('Logged out successfully', null);
    }

    public function logoutAll(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            $this->logService->warningLog('Auth', 'Logout all attempted without authentication');
            return ResponseHelper::error('Unauthenticated', null, 401);
        }

        $this->logService->infoLog(
            'Auth',
            'Success: User logged out from all devices'
        );

        DB::table('sessions')->where('user_id', $user->id)->delete();
        $user->setRememberToken(Str::random(60));
        $user->save();

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return ResponseHelper::success('Logged out from all devices successfully', null);
    }
}