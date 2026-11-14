<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Root Route -> Admin Authentication / Dashboard
|--------------------------------------------------------------------------
*/
Route::get('/', fn () => auth()->check()
    ? redirect()->route('admin.dashboard')
    : redirect()->route('admin.login')
)->name('root');

/*
|--------------------------------------------------------------------------
| Admin Panel & Dashboard Routes (/admin/*)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->name('admin.')->group(function () {
    require __DIR__.'/web/auth.php';

    Route::middleware('auth')->group(function () {
        require __DIR__.'/web/dashboard/overview.php';
        require __DIR__.'/web/dashboard/content.php';
        require __DIR__.'/web/dashboard/administration.php';
    });
});

/*
|--------------------------------------------------------------------------
| Public Portfolio & Verification Routes (/{slug}/*)
|--------------------------------------------------------------------------
*/
require __DIR__.'/web/portfolio.php';
