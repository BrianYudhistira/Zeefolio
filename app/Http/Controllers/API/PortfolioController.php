<?php

namespace App\Http\Controllers\API;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Portfolio\UpdatePortfolioRequest;
use App\Services\LogService;
use App\Services\PortfolioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PortfolioController extends Controller
{
    public function __construct(
        protected PortfolioService $portfolioService,
        protected LogService $logService,
    ) {}

    public function getPortfolioByUserId(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            $this->logService->warningLog('Portfolio', 'Unauthorized portfolio access attempt');

            return ResponseHelper::error('Unauthorized', null, 401);
        }

        $portfolio = $this->portfolioService->getPortfolio($user);

        if (! $portfolio) {
            $this->logService->warningLog('Portfolio', 'Portfolio not found');

            return ResponseHelper::error('Portfolio not found', null, 404);
        }

        return ResponseHelper::success('Portfolio retrieved successfully', $portfolio);
    }

    public function getPortfolioHome(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            $this->logService->warningLog('Portfolio', 'Unauthorized home section access attempt');

            return ResponseHelper::error('Unauthorized', null, 401);
        }

        $homeSection = $this->portfolioService->getHomeSection($user);

        if (! $homeSection) {
            $this->logService->warningLog('Portfolio', 'Home section not found');

            return ResponseHelper::error('Home section not found', null, 404);
        }

        return ResponseHelper::success('Home section retrieved successfully', $homeSection);
    }

    public function getPortfolioAbout(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            $this->logService->warningLog('Portfolio', 'Unauthorized about section access attempt');

            return ResponseHelper::error('Unauthorized', null, 401);
        }

        $aboutSection = $this->portfolioService->getAboutSection($user);

        if (! $aboutSection) {
            $this->logService->warningLog('Portfolio', 'About section not found');

            return ResponseHelper::error('About section not found', null, 404);
        }

        return ResponseHelper::success('About section retrieved successfully', $aboutSection);
    }

    public function getPortfolioSkills(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            $this->logService->warningLog('Portfolio', 'Unauthorized skills access attempt');

            return ResponseHelper::error('Unauthorized', null, 401);
        }

        $skillsSection = $this->portfolioService->getSkillsSection($user);

        if (! $skillsSection) {
            $this->logService->warningLog('Portfolio', 'Skills section not found');

            return ResponseHelper::error('Skills section not found', null, 404);
        }

        return ResponseHelper::success('Skills retrieved successfully', $skillsSection);
    }

    public function getLogo(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            $this->logService->warningLog('Portfolio', 'Unauthorized logo access attempt');

            return ResponseHelper::error('Unauthorized', null, 401);
        }

        $logoSetting = $this->portfolioService->getLogoSetting();

        if (! $logoSetting) {
            $this->logService->warningLog('Portfolio', 'Logo setting not found');

            return ResponseHelper::error('Logo setting not found', null, 404);
        }

        return ResponseHelper::success('Logo retrieved successfully', [
            'id' => $logoSetting->id,
            'name' => $logoSetting->name,
            'path' => $logoSetting->path,
            'value' => $logoSetting->value,
            'file_url' => $logoSetting->file_url,
        ]);
    }

    public function addPortfolio(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            $this->logService->warningLog('Portfolio', 'Unauthorized portfolio creation attempt');

            return ResponseHelper::error('Unauthorized', null, 401);
        }

        if ($user->portfolioUser()->exists()) {
            $this->logService->warningLog('Portfolio', 'Portfolio already exists');

            return ResponseHelper::error('Portfolio already exists', null, 400);
        }

        $portfolio = $this->portfolioService->createDefaultPortfolio($user);
        $this->logService->infoLog('Portfolio', 'Portfolio created successfully');

        return ResponseHelper::success('Portfolio created successfully', $portfolio, 201);
    }

    public function editPortfolioHome(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            $this->logService->warningLog('Portfolio', 'Unauthorized home section update attempt');

            return ResponseHelper::error('Unauthorized', null, 401);
        }

        $validatedData = $request->validate([
            'greeting' => ['nullable', 'string', 'max:255'],
            'name' => ['nullable', 'string', 'max:255'],
            'passions' => ['nullable', 'array'],
            'passions.*' => ['string', 'max:100'],
            'description' => ['nullable', 'string'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'image' => ['nullable', 'image', 'max:2048'],
            'cv' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
            'social_media_links' => ['nullable', 'array'],
            'social_media_links.*' => ['string', 'max:255'],
        ]);

        $homeSection = $this->portfolioService->editHomeSection($user, $validatedData);

        if (! $homeSection) {
            $this->logService->warningLog('Portfolio', 'Portfolio not found for home update');

            return ResponseHelper::error('Portfolio not found', null, 404);
        }

        $this->logService->infoLog('Portfolio', 'Home section updated successfully');

        return ResponseHelper::success('Home section updated successfully', $homeSection);
    }

    public function editAbout(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            $this->logService->warningLog('Portfolio', 'Unauthorized about section update attempt');

            return ResponseHelper::error('Unauthorized', null, 401);
        }

        $validatedData = $request->validate([
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:2048'],
            'cv' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
        ]);

        $homeSection = $this->portfolioService->editHomeSection($user, $validatedData);

        if (! $homeSection) {
            $this->logService->warningLog('Portfolio', 'Portfolio not found for about update');

            return ResponseHelper::error('Portfolio not found', null, 404);
        }

        $this->logService->infoLog('Portfolio', 'About section updated successfully');

        return ResponseHelper::success('About section updated successfully', $homeSection);
    }

    public function editProjectsOrder(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            $this->logService->warningLog('Portfolio', 'Unauthorized project order update attempt');

            return ResponseHelper::error('Unauthorized', null, 401);
        }

        $validated = $request->validate([
            'projects' => ['required', 'array'],
            'projects.*.id' => ['required', 'integer', 'exists:projects,id'],
            'projects.*.sort_order' => ['nullable', 'integer'],
            'projects.*.is_featured' => ['nullable', 'boolean'],
        ]);

        $updatedIds = $this->portfolioService->updateProjectsOrder($user, $validated['projects']);

        if ($updatedIds === null) {
            $this->logService->warningLog('Portfolio', 'Portfolio not found for project order update');

            return ResponseHelper::error('Portfolio not found', null, 404);
        }

        $this->logService->infoLog('Portfolio', 'Projects order updated successfully');

        return ResponseHelper::success('Projects order updated successfully', ['updated_projects' => $updatedIds]);
    }

    public function editContacts(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            $this->logService->warningLog('Portfolio', 'Unauthorized contacts update attempt');

            return ResponseHelper::error('Unauthorized', null, 401);
        }

        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $contacts = $this->portfolioService->editContactsSection($user, $validated);

        if (! $contacts) {
            $this->logService->warningLog('Portfolio', 'Portfolio not found for contacts update');

            return ResponseHelper::error('Portfolio not found', null, 404);
        }

        $this->logService->infoLog('Portfolio', 'Contacts section updated successfully');

        return ResponseHelper::success('Contacts section updated successfully', $contacts);
    }

    public function editPortfolioFormData(UpdatePortfolioRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            $this->logService->warningLog('Portfolio', 'Unauthorized portfolio form update attempt');

            return ResponseHelper::error('Unauthorized', null, 401);
        }

        $files = [
            'about_image' => $request->file('about_image'),
            'about_cv' => $request->file('about_cv'),
            'project_images' => $request->file('project_images'),
            'home_logo' => $request->file('home_logo'),
        ];

        $portfolio = $this->portfolioService->createOrUpdatePortfolio(
            $user,
            $request->validated(),
            $files,
        );

        $this->logService->infoLog('Portfolio', 'Portfolio updated successfully via form-data');

        return ResponseHelper::success('Portfolio updated successfully', $portfolio);
    }

    public function editPortfolioJsonData(UpdatePortfolioRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            $this->logService->warningLog('Portfolio', 'Unauthorized portfolio JSON update attempt');

            return ResponseHelper::error('Unauthorized', null, 401);
        }

        $portfolio = $this->portfolioService->createOrUpdatePortfolio(
            $user,
            $request->validated(),
        );

        $this->logService->infoLog('Portfolio', 'Portfolio updated successfully via JSON');

        return ResponseHelper::success('Portfolio updated successfully', $portfolio);
    }

    public function deleteportfolio(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            $this->logService->warningLog('Portfolio', 'Unauthorized portfolio deletion attempt');

            return ResponseHelper::error('Unauthorized', null, 401);
        }

        $validated = $request->validate([
            'password' => ['required', 'string'],
        ]);

        if (! Hash::check($validated['password'], $user->password)) {
            $this->logService->warningLog('Portfolio', 'Incorrect password for portfolio deletion');

            return ResponseHelper::error('Incorrect password', null, 403);
        }

        $portfolio = $user->portfolioUser()->first();

        if (! $portfolio) {
            $this->logService->warningLog('Portfolio', 'Portfolio not found for deletion');

            return ResponseHelper::error('Portfolio not found', null, 404);
        }

        $this->portfolioService->deletePortfolio($portfolio);
        $this->logService->infoLog('Portfolio', 'Portfolio deleted successfully');

        return ResponseHelper::success('Portfolio deleted successfully');
    }
}
