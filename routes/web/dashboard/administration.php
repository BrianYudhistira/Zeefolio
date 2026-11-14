<?php

use App\Http\Controllers\Admin\LogController;
use App\Http\Controllers\Admin\MemberPortfolioController;
use App\Http\Controllers\Admin\RolePermissionController;
use App\Http\Controllers\Admin\SettingController;
use Illuminate\Support\Facades\Route;

// ── System & Activity Logs (permission: logs.view) ──
Route::middleware('permission:logs.view')
    ->prefix('logs')
    ->name('logs.')
    ->group(function () {
        Route::get('/', [LogController::class, 'index'])->name('index');
    });

// ── Member Accounts & Portfolios ──
Route::prefix('members')->name('members.')->group(function () {
    Route::get('/', [MemberPortfolioController::class, 'index'])
        ->middleware('permission:members.view')
        ->name('index');
    Route::post('/', [MemberPortfolioController::class, 'store'])
        ->middleware('permission:members.create')
        ->name('store');
    Route::put('/{member}', [MemberPortfolioController::class, 'update'])
        ->middleware('permission:members.edit')
        ->name('update');
    Route::delete('/{member}', [MemberPortfolioController::class, 'destroy'])
        ->middleware('permission:members.delete')
        ->name('destroy');
    Route::get('/{member}/preview', [MemberPortfolioController::class, 'preview'])
        ->middleware('permission:members.view')
        ->name('preview');
    Route::put('/skills/{techStack}/promote', [MemberPortfolioController::class, 'promoteSkill'])
        ->middleware('permission:skills.promote')
        ->name('skills.promote');
});

// ── Spatie Roles & Permissions (RBAC) ──
Route::prefix('roles')->name('roles.')->group(function () {
    Route::get('/', [RolePermissionController::class, 'index'])
        ->middleware('permission:roles.manage|permissions.manage')
        ->name('index');

    Route::middleware('permission:roles.manage')->group(function () {
        Route::post('/', [RolePermissionController::class, 'storeRole'])->name('store');
        Route::put('/{role}', [RolePermissionController::class, 'updateRole'])->name('update');
        Route::delete('/{role}', [RolePermissionController::class, 'destroyRole'])->name('destroy');
    });
});

Route::middleware('permission:permissions.manage')
    ->prefix('permissions')
    ->name('permissions.')
    ->group(function () {
        Route::post('/', [RolePermissionController::class, 'storePermission'])->name('store');
        Route::put('/{permission}', [RolePermissionController::class, 'updatePermission'])->name('update');
        Route::delete('/{permission}', [RolePermissionController::class, 'destroyPermission'])->name('destroy');
    });

// ── Global Platform Settings (permission: settings.manage) ──
Route::middleware('permission:settings.manage')
    ->prefix('settings')
    ->name('settings.')
    ->group(function () {
        Route::get('/', [SettingController::class, 'index'])->name('index');

        Route::post('/global-skills', [SettingController::class, 'storeGlobalSkill'])->name('skills.store');
        Route::put('/global-skills/{techStack}', [SettingController::class, 'updateGlobalSkill'])->name('skills.update');
        Route::delete('/global-skills/{techStack}', [SettingController::class, 'destroyGlobalSkill'])->name('skills.destroy');

        Route::post('/categories', [SettingController::class, 'storeCategory'])->name('categories.store');
        Route::put('/categories/{category}', [SettingController::class, 'updateCategory'])->name('categories.update');
        Route::delete('/categories/{category}', [SettingController::class, 'destroyCategory'])->name('categories.destroy');

        Route::post('/project-categories', [SettingController::class, 'storeProjectCategory'])->name('project-categories.store');
        Route::put('/project-categories/{projectCategory}', [SettingController::class, 'updateProjectCategory'])->name('project-categories.update');
        Route::delete('/project-categories/{projectCategory}', [SettingController::class, 'destroyProjectCategory'])->name('project-categories.destroy');
    });

