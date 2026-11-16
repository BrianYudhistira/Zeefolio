<?php

use App\Http\Controllers\Admin\AccountController;
use App\Http\Controllers\Portfolio\PortfolioController;
use App\Models\PortfolioUser;
use Illuminate\Support\Facades\Route;

// ── Signed Email Verification Link ──
Route::get('/verify-email/{id}/{hash}', [AccountController::class, 'verifyEmail'])
    ->middleware('signed')
    ->name('verification.verify');

// ── Contact Form Submission (Rate Limited: SEC-10) ──
Route::post('/messageMe', [PortfolioController::class, 'sendMessage'])
    ->middleware('throttle:5,1')
    ->name('portfolio.sendMessage');

// ── Legacy Project & Portfolio Redirects ──
Route::get('/projects', [PortfolioController::class, 'redirectLegacyProjects'])->name('portfolio.projects.legacy');
Route::get('/projects/{projectSlug}', [PortfolioController::class, 'redirectLegacyProjectDetail'])->name('portfolio.project.legacy');

foreach (['me', 'v2'] as $legacyPrefix) {
    Route::prefix($legacyPrefix)->group(function () {
        Route::get('/', function () {
            $defaultSlug = PortfolioUser::orderBy('id')->value('slug') ?? 'brian-yudhistira';

            return redirect()->route('portfolio.index', ['slug' => $defaultSlug]);
        });
        Route::get('/projects', [PortfolioController::class, 'redirectLegacyProjects']);
        Route::get('/projects/{projectSlug}', [PortfolioController::class, 'redirectLegacyProjectDetail']);
    });
}

// ── Public User Portfolio Routes by Slug (/{slug}) ──
$slugPattern = '^(?!' . implode('|', PortfolioUser::RESERVED_SLUGS) . ')[a-zA-Z0-9-_]+$';

Route::prefix('{slug}')
    ->where(['slug' => $slugPattern])
    ->group(function () {
        Route::get('/', [PortfolioController::class, 'index'])->name('portfolio.index');
        Route::get('/projects', [PortfolioController::class, 'listProject'])->name('portfolio.projects');
        Route::get('/projects/{projectSlug}', [PortfolioController::class, 'getProjectBySlug'])->name('portfolio.project');
        Route::post('/messageMe', [PortfolioController::class, 'sendMessage'])
            ->middleware('throttle:5,1')
            ->name('portfolio.user.sendMessage');
    });
