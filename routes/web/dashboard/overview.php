<?php

use App\Http\Controllers\Admin\AccountController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\NotificationStreamController;
use Illuminate\Support\Facades\Route;

// ── Dashboard Overview ──
Route::get('/', fn () => redirect()->route('admin.dashboard'));
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware('permission:dashboard.view')
    ->name('dashboard');

// ── User Notifications (Page, SSE Stream, Read, Popup Dismiss, Soft Delete) ──
Route::prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/', [NotificationController::class, 'index'])->name('index');
    Route::get('/stream', [NotificationStreamController::class, 'index'])->name('stream');
    Route::put('/read-all', [NotificationController::class, 'markAllAsRead'])->name('read-all');
    Route::put('/popup-clear', [NotificationController::class, 'dismissAllFromPopup'])->name('popup-clear');
    Route::put('/{notification}/read', [NotificationController::class, 'markAsRead'])->name('read');
    Route::put('/{notification}/popup-dismiss', [NotificationController::class, 'dismissFromPopup'])->name('popup-dismiss');
    Route::delete('/', [NotificationController::class, 'clearAll'])->name('clear');
    Route::delete('/{notification}', [NotificationController::class, 'destroy'])->name('destroy');
});

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

