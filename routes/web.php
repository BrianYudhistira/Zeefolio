<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Portfolio\PortfolioController;
use Inertia\Inertia;

// Primary Portfolio Routes
Route::get('/', [PortfolioController::class, 'index'])->name('portfolio.index');
Route::get('/projects', [PortfolioController::class, 'listProject'])->name('portfolio.projects');
Route::get('/projects/{slug}', [PortfolioController::class, 'getProjectBySlug'])->name('portfolio.project');

// Legacy redirects for /me and /v2
Route::prefix('me')->group(function () {
    Route::get('/', fn() => redirect()->route('portfolio.index'));
    Route::get('/projects', fn() => redirect()->route('portfolio.projects'));
    Route::get('/projects/{slug}', fn($slug) => redirect()->route('portfolio.project', ['slug' => $slug]));
});

Route::prefix('v2')->group(function () {
    Route::get('/', fn() => redirect()->route('portfolio.index'));
    Route::get('/projects', fn() => redirect()->route('portfolio.projects'));
    Route::get('/projects/{slug}', fn($slug) => redirect()->route('portfolio.project', ['slug' => $slug]));
});

Route::post('/messageMe', [PortfolioController::class, 'sendMessage'])->name('portfolio.sendMessage');

Route::get('/test', function () {
    return new \App\Mail\SendMailToMe(
        'John Doe', 
        'test@gmail.com', 
        'Hello, this is a test message.'
    );
});

Route::get('/verify-email/{id}/{hash}', [App\Http\Controllers\API\EmailVerificationController::class, 'verify'])->name('verification.verify')->middleware('signed');
