<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Services\PortfolioService;
use App\Services\LogService;
use App\Helpers\ResponseHelper;
use App\Models\PortfolioSetting;

class PortfolioController
{
    public function __construct(
        protected PortfolioService $portfolioService,
        protected LogService $logService
    ) {}
    
    public function getPortfolioByUserId(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            $this->logService->warningLog('Portfolio', 'Unauthorized portfolio access attempt');
            return ResponseHelper::error('Unauthorized', null, 401);
        }

        $portfolio = $this->portfolioService->getPortfolio($user);

        if (!$portfolio) {
            $this->logService->warningLog('Portfolio', 'Portfolio not found');
            return ResponseHelper::error('Portfolio not found', null, 404);
        }

        return ResponseHelper::success('Portfolio retrieved successfully', $portfolio);
    }

    public function getPortfolioHome(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            $this->logService->warningLog('Portfolio', 'Unauthorized home section access attempt');
            return ResponseHelper::error('Unauthorized', null, 401);
        }

        $homeSection = $this->portfolioService->getHomeSection($user);

        if (!$homeSection) {
            $this->logService->warningLog('Portfolio', 'Home section not found');
            return ResponseHelper::error('Home section not found', null, 404);
        }

        return ResponseHelper::success('Home section retrieved successfully', $homeSection);
    }

    public function editPortfolioHome(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            $this->logService->warningLog('Portfolio', 'Unauthorized home section update attempt');
            return ResponseHelper::error('Unauthorized', null, 401);
        }

        $validatedData = $request->validate([
            'greeting' => 'nullable|string|max:255',
            'name' => 'nullable|string|max:255',
            'passions' => 'nullable|array',
            'passions.*' => 'string|max:100',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'cv' => 'nullable|file|max:2048',
            'social_media_links' => 'nullable|array',
            'social_media_links.*' => 'string|max:255'
        ]);

        $this->portfolioService->editHomeSection($user, $validatedData);
        $this->logService->infoLog('Portfolio', 'Home section updated successfully');

        return ResponseHelper::success('Home section updated successfully');
    }

    public function getPortfolioSkills(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            $this->logService->warningLog('Portfolio', 'Unauthorized skills access attempt');
            return ResponseHelper::error('Unauthorized', null, 401);
        }

        $skillsSection = $this->portfolioService->getSkillsSection($user);

        if (!$skillsSection) {
            $this->logService->warningLog('Portfolio', 'Skills section not found');
            return ResponseHelper::error('Skills section not found', null, 404);
        }

        return ResponseHelper::success('Skills retrieved successfully', $skillsSection);
    }

    public function getLogo(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            $this->logService->warningLog('Portfolio', 'Unauthorized logo access attempt');
            return ResponseHelper::error('Unauthorized', null, 401);
        }

        // Get 'logo' setting from portfolio settings
        $logoSetting = PortfolioSetting::where('name', 'logo')->first();

        if (!$logoSetting) {
            $this->logService->warningLog('Portfolio', 'Logo setting not found');
            return ResponseHelper::error('Logo setting not found', null, 404);
        }

        return ResponseHelper::success('Logo retrieved successfully', [
            'id' => $logoSetting->id,
            'name' => $logoSetting->name,
            'path' => $logoSetting->path,
            'value' => $logoSetting->value,
            'file_url' => $logoSetting->file_url
        ]);
    }

    public function addPortfolio(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            $this->logService->warningLog('Portfolio', 'Unauthorized portfolio creation attempt');
            return ResponseHelper::error('Unauthorized', null, 401);
        }

        // Check if portfolio already exists
        if ($user->portfolioUser()->exists()) {
            $this->logService->warningLog('Portfolio', 'Portfolio already exists');
            return ResponseHelper::error('Portfolio already exists', null, 400);
        }

        // Create new portfolio with default sections
        $portfolio = $user->portfolioUser()->create();

        $portfolio->home()->create([
            'greeting' => 'Hello, I am',
            'name' => 'Your Name',
            'passion' => 'Your Passion',
            'description' => 'A brief description about yourself.',
            'logo_path' => null,
        ]);

        $portfolio->about()->create([
            'title' => 'About Me',
            'description' => 'A detailed description about yourself.',
            'skills' => json_encode([]),
            'image_path' => null,
            'cv_path' => null,
        ]);

        $portfolio->contacts()->create([
            'email' => '',
            'phone' => '',
            'address' => '',
            'linkedin' => '',
            'github' => '',
            'twitter' => '',
        ]);
        $this->logService->infoLog('Portfolio', 'Portfolio created successfully');

        return ResponseHelper::success('Portfolio created successfully', $portfolio, 201);
    }
}