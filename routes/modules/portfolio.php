<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\PortfolioController;

// Protected portfolio endpoints
Route::middleware(['throttle:60,1'])->group(function () {
    Route::get('/portfolio', [PortfolioController::class, 'getPortfolioByUserId'])->name('portfolio');
    Route::get('/asset/logos', [PortfolioController::class, 'getLogo'])->name('asset.logo');
    Route::get('/portfolio/home', [PortfolioController::class, 'getPortfolioHome'])->name('portfolio.home');
    Route::get('/portfolio/about', [PortfolioController::class, 'getPortfolioAbout'])->name('portfolio.about');
    Route::get('/portfolio/skills', [PortfolioController::class, 'getPortfolioSkills'])->name('portfolio.skills');

    Route::post('/portfolio/update_home', [PortfolioController::class, 'editPortfolioHome'])->name('portfolio.home.edit');
    Route::post('/portfolio/update_about', [PortfolioController::class, 'editAbout'])->name('portfolio.about.edit');
    Route::post('/portfolio/update_projects/order', [PortfolioController::class, 'editProjectsOrder'])->name('portfolio.projects.edit');
    Route::post('/portfolio/update_contacts', [PortfolioController::class, 'editContacts'])->name('portfolio.contacts.edit');
    Route::post('/update_portfolioForm', [PortfolioController::class, 'editPortfolioFormData'])->name('portfolio.edit.form');
    Route::post('/update_portfolioJson', [PortfolioController::class, 'editPortfolioJsonData'])->name('portfolio.edit');
    
    Route::delete('/portfolio/delete', [PortfolioController::class, 'deleteportfolio'])->name('portfolio.delete');
});
