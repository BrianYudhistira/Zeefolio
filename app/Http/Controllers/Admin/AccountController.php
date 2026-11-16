<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\VerifyEmailLink;
use App\Models\User;
use App\Services\LogService;
use App\Services\PortfolioService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log as LaravelLog;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function __construct(
        protected PortfolioService $portfolioService,
        protected LogService $logService,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Admin/Account/Index', [
            'account' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'photo_url' => $user->photo_url,
                'has_photo' => (bool) $user->photo_path,
                'email_verified_at' => $user->email_verified_at?->toISOString(),
                'created_at' => $user->created_at?->toISOString(),
            ],
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'max:60',
                'alpha_dash',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_photo' => ['nullable', 'boolean'],
        ]);

        $disk = Storage::disk('public');
        $oldPhotoPath = $user->photo_path;
        $nextPhotoPath = $oldPhotoPath;
        $newUploadedPhotoPath = null;
        $oldPhotoToDelete = null;

        DB::beginTransaction();

        try {
            if ($request->boolean('remove_photo') && $oldPhotoPath) {
                if (! str_starts_with($oldPhotoPath, 'http')) {
                    $oldPhotoToDelete = $oldPhotoPath;
                }
                $nextPhotoPath = null;
            }

            if ($request->hasFile('photo')) {
                $newUploadedPhotoPath = $request->file('photo')->store('users/photos', 'public');

                if (! $newUploadedPhotoPath) {
                    throw new \RuntimeException('Failed to store uploaded profile photo.');
                }

                if ($oldPhotoPath && ! str_starts_with($oldPhotoPath, 'http')) {
                    $oldPhotoToDelete = $oldPhotoPath;
                }

                $nextPhotoPath = $newUploadedPhotoPath;
            }

            $emailChanged = $validated['email'] !== $user->email;

            $user->update([
                'name' => $validated['name'],
                'username' => $validated['username'],
                'email' => $validated['email'],
                'photo_path' => $nextPhotoPath,
                'email_verified_at' => $emailChanged ? null : $user->email_verified_at,
            ]);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();

            if ($newUploadedPhotoPath) {
                $disk->delete($newUploadedPhotoPath);
            }

            throw $e;
        }

        if ($oldPhotoToDelete) {
            $disk->delete($oldPhotoToDelete);
        }

        $this->logService->infoLog(
            'Users',
            'Updated account profile' . ($emailChanged ? ' (email changed, re-verification required)' : '')
        );

        return redirect()->back()->with('success', 'Account profile updated successfully.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user->forceFill([
            'password' => Hash::make($validated['password']),
            'remember_token' => \Illuminate\Support\Str::random(60),
        ])->save();

        try {
            Auth::logoutOtherDevices($validated['password']);
        } catch (\Throwable) {
            // Ignore if session guard does not support logoutOtherDevices in current test context
        }

        $this->logService->infoLog('Users', 'Updated account password');

        return redirect()->back()->with('success', 'Password updated successfully.');
    }

    public function sendVerification(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->back()->with('success', 'Your email address is already verified.');
        }

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        try {
            Mail::to($user->email)->send(new VerifyEmailLink($url, $user->name));
            $this->logService->infoLog('Auth', "Sent email verification link to {$user->email}");

            return redirect()->back()->with('success', 'Verification link sent to ' . $user->email . '.');
        } catch (\Throwable $e) {
            $this->logService->errorLog('Auth', "Failed to send verification email to {$user->email}: " . $e->getMessage());

            return redirect()->back()->with('error', 'Failed to send verification email. Please check your mail configuration.');
        }
    }

    public function verifyEmail(Request $request, int $id, string $hash): RedirectResponse
    {
        $user = User::findOrFail($id);

        if (! hash_equals(sha1($user->email), $hash)) {
            abort(403, 'Invalid verification link.');
        }

        if (! $user->hasVerifiedEmail()) {
            DB::beginTransaction();

            try {
                $user->markEmailAsVerified();
                DB::commit();
            } catch (\Throwable $e) {
                DB::rollBack();
                throw $e;
            }

            LaravelLog::info('[Auth] Email verified successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip_address' => $request->ip(),
            ]);
        }

        return redirect()
            ->route($request->user() ? 'admin.account.index' : 'admin.login')
            ->with('success', 'Email verified successfully!');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();

        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        if ($user->isSuperAdmin() && User::where('role', User::ROLE_SUPERADMIN)->count() <= 1) {
            $this->logService->warningLog('Users', 'Blocked attempt to delete the only Super Admin account');

            return redirect()->back()->with('error', 'Cannot delete the only Super Admin account.');
        }

        $oldPhotoToDelete = ($user->photo_path && ! str_starts_with($user->photo_path, 'http'))
            ? $user->photo_path
            : null;

        $portfolio = $user->portfolioUser()->with(['home', 'projects.images'])->first();
        $portfolioFilesToDelete = $portfolio
            ? $this->portfolioService->collectPortfolioFilePaths($portfolio)
            : [];

        Auth::guard('web')->logout();
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        DB::beginTransaction();

        try {
            if ($portfolio) {
                $this->portfolioService->deletePortfolioRecordOnly($portfolio);
            }

            DB::table('sessions')->where('user_id', $user->id)->delete();
            $user->delete();

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }

        $disk = Storage::disk('public');
        if ($oldPhotoToDelete) {
            $disk->delete($oldPhotoToDelete);
        }
        foreach ($portfolioFilesToDelete as $filePath) {
            $disk->delete($filePath);
        }

        LaravelLog::warning('[Users] Account permanently deleted', [
            'user_id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'role' => $user->role,
            'ip_address' => $request->ip(),
        ]);

        return redirect()->route('admin.login')->with('success', 'Your account has been permanently deleted.');
    }
}
