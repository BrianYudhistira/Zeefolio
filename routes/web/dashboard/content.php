<?php

use App\Http\Controllers\Admin\ContactController;
use App\Http\Controllers\Admin\ExperienceController;
use App\Http\Controllers\Admin\HomeController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\SkillController;
use App\Http\Controllers\Admin\TechStackController;
use Illuminate\Support\Facades\Route;

// ── Home Profile (permission: home.manage) ─────────────────────────────
Route::middleware('permission:home.manage')->group(function () {
    Route::prefix('home')->name('home.')->group(function () {
        Route::get('/', [HomeController::class, 'index'])->name('index');
        Route::post('/', [HomeController::class, 'update'])->name('update');
    });
});

// ── Contact Channels (permission: contacts.manage) ─────────────────────
Route::middleware('permission:contacts.manage')->group(function () {
    Route::prefix('contacts')->name('contacts.')->group(function () {
        Route::get('/', [ContactController::class, 'index'])->name('index');
        Route::put('/', [ContactController::class, 'update'])->name('update');
    });
});

// ── Projects & User Categories (permission: projects.manage) ──
Route::middleware('permission:projects.manage')
    ->prefix('projects')
    ->name('projects.')
    ->group(function () {
        Route::get('/', [ProjectController::class, 'index'])->name('index');
        Route::post('/', [ProjectController::class, 'store'])->name('store');
        Route::post('/categories', [ProjectController::class, 'storeCategory'])->name('categories.store');
        Route::put('/categories/{projectCategory}', [ProjectController::class, 'updateCategory'])->name('categories.update');
        Route::delete('/categories/{projectCategory}', [ProjectController::class, 'destroyCategory'])->name('categories.destroy');
        Route::post('/{project}', [ProjectController::class, 'update'])->name('update');
        Route::delete('/{project}', [ProjectController::class, 'destroy'])->name('destroy');
    });

// ── Skills (permission: skills.manage) ─────────────────────────────────
Route::middleware('permission:skills.manage')->group(function () {
    Route::prefix('skills')->name('skills.')->group(function () {
        Route::get('/', [SkillController::class, 'index'])->name('index');
        Route::post('/', [SkillController::class, 'store'])->name('store');
        Route::put('/categories', [SkillController::class, 'updateCategories'])->name('categories.update');
        Route::put('/{skill}', [SkillController::class, 'update'])->name('update');
        Route::delete('/{skill}', [SkillController::class, 'destroy'])->name('destroy');
    });
});

// ── Custom Tech Stacks (permission: tech-stacks.manage) ────────────────
Route::middleware('permission:tech-stacks.manage')->group(function () {
    Route::prefix('tech-stacks')->name('tech-stacks.')->group(function () {
        Route::get('/', [TechStackController::class, 'index'])->name('index');
        Route::post('/', [TechStackController::class, 'store'])->name('store');
        Route::put('/{techStack}', [TechStackController::class, 'update'])->name('update');
        Route::delete('/{techStack}', [TechStackController::class, 'destroy'])->name('destroy');
    });
});

// ── Career & Education Experiences (permission: experiences.manage) ──
Route::middleware('permission:experiences.manage')
    ->prefix('experiences')
    ->name('experiences.')
    ->group(function () {
        Route::get('/', [ExperienceController::class, 'index'])->name('index');
        Route::post('/', [ExperienceController::class, 'store'])->name('store');
        Route::put('/{experience}', [ExperienceController::class, 'update'])->name('update');
        Route::put('/{experience}/move', [ExperienceController::class, 'move'])->name('move');
        Route::delete('/{experience}', [ExperienceController::class, 'destroy'])->name('destroy');
    });

