<?php

use App\Http\Controllers\Admin\AccountController;
use App\Http\Controllers\Admin\DashboardController;
use Illuminate\Support\Facades\Route;

// ── Dashboard Overview ──
Route::get('/', fn () => redirect()->route('admin.dashboard'));
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware('permission:dashboard.view')
    ->name('dashboard');

// ── Personal Account Settings ──
Route::prefix('account')->name('account.')->group(function () {
    Route::get('/', [AccountController::class, 'index'])->name('index');
    Route::post('/profile', [AccountController::class, 'updateProfile'])->name('profile');
    Route::put('/password', [AccountController::class, 'updatePassword'])->name('password');
    Route::post('/email/verification-notification', [AccountController::class, 'sendVerification'])
        ->middleware('throttle:6,1')
        ->name('verification.send');
    Route::delete('/', [AccountController::class, 'destroy'])->name('destroy');
});

