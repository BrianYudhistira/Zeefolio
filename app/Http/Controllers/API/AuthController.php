<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Services\LogService;
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
                Log::warning('Failed login attempt', [
                    'email' => $validated['email'],
                    'local_check' => app()->isLocal(),
                ]);
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
            Log::info('User logged in', [
                'user_id' => $user->id,
                'email' => $user->email,
                'local_check' => app()->isLocal(),
            ]);

            return response()->json([
                'message' => 'Login successful',
                'user' => $user,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Login error', [
                'message' => $e->getMessage(),
                'local_check' => app()->isLocal(),
            ]);
            $this->logService->errorLog(
                'Auth',
                'Login error: ' . $e->getMessage()
            );
            return response()->json(['message' => $e->getMessage()], 401);
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
                Log::warning('Failed remembered login attempt for email: ' . $validated['email']);
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
            Log::info('User logged in with remember me', [
                'user_id' => $user->id,
                'email' => $user->email,
                'local_check' => app()->isLocal(),
            ]);
            return response()->json([
                'message' => 'Login successful',
                'user' => $user,
            ], 200);

        } catch(\Exception $e) {
            Log::error('Remembered login error', [
                'message' => $e->getMessage(),
                'local_check' => app()->isLocal(),
            ]);
            $this->logService->errorLog(
                'Auth',
                'Remembered login error: ' . $e->getMessage()
            );
            return response()->json(['message' => $e->getMessage()], 401);
        }
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            Log::warning('Logout attempted without authentication', [
                'local_check' => app()->isLocal(),
            ]);
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $this->logService->infoLog(
            'Auth',
            'Success: User logged out'
        );
        Log::info('User logged out', [
            'user_id' => $user->id,
            'local_check' => app()->isLocal(),
        ]);

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully'], 200);
    }

    public function logoutAll(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            Log::warning('Logout all attempted without authentication', [
                'local_check' => app()->isLocal(),
            ]);
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $this->logService->infoLog(
            'Auth',
            'Success: User logged out from all devices'
        );
        Log::info('User logged out from all devices', [
            'user_id' => $user->id,
            'local_check' => app()->isLocal(),
        ]);

        DB::table('sessions')->where('user_id', $user->id)->delete();
        $user->setRememberToken(Str::random(60));
        $user->save();

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out from all devices successfully'], 200);
    }
}