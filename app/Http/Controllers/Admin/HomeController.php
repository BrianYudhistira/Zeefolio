<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ResolvesAdminPortfolio;
use App\Http\Controllers\Controller;
use App\Services\LogService;
use App\Services\PortfolioService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    use ResolvesAdminPortfolio;

    public function __construct(
        protected PortfolioService $portfolioService,
        protected LogService $logService,
    ) {}

    public function index(Request $request): Response
    {
        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);
        $home = $portfolio->home()->first();

        return Inertia::render('Admin/Home/Index', [
            'home' => $home,
            'portfolioMeta' => [
                'slug' => $portfolio->slug,
                'is_active' => (bool) $portfolio->is_active,
                'theme' => $portfolio->theme,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);
        $oldSlug = $portfolio->slug;

        if ($request->filled('slug')) {
            $request->merge([
                'slug' => Str::slug($request->input('slug')),
            ]);
        }

        if (is_array($request->input('social_media_links'))) {
            $normalizedLinks = [];
            foreach ($request->input('social_media_links', []) as $key => $val) {
                $trimmed = is_string($val) ? trim($val) : null;
                $normalizedLinks[$key] = $trimmed !== '' ? $trimmed : null;
            }
            $request->merge(['social_media_links' => $normalizedLinks]);
        }

        $validated = $request->validate([
            'greeting' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                'alpha_dash',
                Rule::notIn(['admin', 'api', 'storage', 'sanctum', 'up', '_boost', 'verify-email', 'messageMe', 'projects', 'me', 'v2']),
                Rule::unique('portfolio_users', 'slug')->ignore($portfolio->id),
            ],
            'passions' => ['nullable', 'array'],
            'passions.*' => ['string', 'max:100'],
            'description' => ['required', 'string'],
            'social_media_links' => ['nullable', 'array'],
            'social_media_links.github' => ['nullable', 'url:http,https', 'max:255'],
            'social_media_links.linkedin' => ['nullable', 'url:http,https', 'max:255'],
            'social_media_links.instagram' => ['nullable', 'url:http,https', 'max:255'],
            'social_media_links.website' => ['nullable', 'url:http,https', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'cv' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
        ]);

        $portfolioUpdates = [];
        if (array_key_exists('is_active', $validated)) {
            $portfolioUpdates['is_active'] = (bool) $validated['is_active'];
        }
        if (! empty($validated['slug'])) {
            $portfolioUpdates['slug'] = $validated['slug'];
        }
        if (! empty($portfolioUpdates)) {
            $portfolio->update($portfolioUpdates);
            $this->portfolioService->forgetSlugCache($oldSlug);
            $this->portfolioService->forgetSlugCache($portfolio->slug);
            $this->clearPortfolioCache($request);
        }

        $this->portfolioService->editHomeSection($request->user(), $validated);
        $this->logService->infoLog('Portfolio', "Updated home section (slug: {$portfolio->slug})");

        return redirect()->back()->with('success', 'Home section updated successfully.');
    }
}

