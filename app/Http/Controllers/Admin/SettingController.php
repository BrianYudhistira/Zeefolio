<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ResolvesAdminPortfolio;
use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectCategory;
use App\Models\TechStack;
use App\Models\TechStackCategory;
use App\Services\LogService;
use App\Services\PortfolioService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    use ResolvesAdminPortfolio;

    public function __construct(
        protected LogService $logService,
        protected PortfolioService $portfolioService,
    ) {}

    public function index(Request $request): Response
    {
        $globalSkills = TechStack::with('category')
            ->where('is_global', true)
            ->orderBy('name')
            ->get();

        $categories = TechStackCategory::global()
            ->withCount([
                'techStacks',
                'techStacks as global_skills_count' => fn ($q) => $q->where('is_global', true),
            ])
            ->orderBy('name')
            ->get();

        $projectCounts = Project::selectRaw('LOWER(project_type) as slug_key, COUNT(*) as aggregate')
            ->whereNotNull('project_type')
            ->groupBy('slug_key')
            ->pluck('aggregate', 'slug_key');

        $projectCategories = ProjectCategory::where('is_global', true)
            ->orderBy('name')
            ->get()
            ->map(function (ProjectCategory $cat) use ($projectCounts) {
                $cat->projects_count = (int) ($projectCounts[strtolower($cat->slug)] ?? 0);

                return $cat;
            });

        return Inertia::render('Admin/Settings/Index', [
            'globalSkills' => $globalSkills,
            'categories' => $categories,
            'projectCategories' => $projectCategories,
        ]);
    }

    public function storeGlobalSkill(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'icon' => ['nullable', 'string', 'max:255'],
            'category_id' => ['nullable', 'exists:tech_stack_categories,id'],
        ]);

        $skill = TechStack::create([
            'name' => trim($validated['name']),
            'icon' => $validated['icon'] ?: null,
            'category_id' => $validated['category_id'] ?: null,
            'is_global' => true,
            'user_id' => null,
        ]);

        $this->portfolioService->bumpCatalogVersion();
        $this->clearPortfolioCache($request);
        $this->logService->adminLog('Settings', "Added default skill: {$skill->name}");

        return redirect()->back()->with('success', "Default skill \"{$skill->name}\" has been added.");
    }

    public function updateGlobalSkill(Request $request, TechStack $techStack): RedirectResponse
    {
        if (! $techStack->is_global) {
            abort(403, 'Only default skills can be edited here.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'icon' => ['nullable', 'string', 'max:255'],
            'category_id' => ['nullable', 'exists:tech_stack_categories,id'],
        ]);

        $techStack->update([
            'name' => trim($validated['name']),
            'icon' => $validated['icon'] ?: null,
            'category_id' => $validated['category_id'] ?: null,
            'is_global' => true,
            'user_id' => null,
        ]);

        $this->portfolioService->bumpCatalogVersion();
        $this->clearPortfolioCache($request);
        $this->logService->adminLog('Settings', "Updated default skill: {$techStack->name}");

        return redirect()->back()->with('success', "Default skill \"{$techStack->name}\" has been updated.");
    }

    public function destroyGlobalSkill(Request $request, TechStack $techStack): RedirectResponse
    {
        if (! $techStack->is_global) {
            abort(403, 'Only default skills can be deleted here.');
        }

        $name = $techStack->name;
        $techStack->delete();

        $this->portfolioService->bumpCatalogVersion();
        $this->clearPortfolioCache($request);
        $this->logService->adminLog('Settings', "Deleted default skill: {$name}");

        return redirect()->back()->with('success', "Default skill \"{$name}\" has been deleted.");
    }

    public function storeCategory(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('tech_stack_categories', 'name')->where('is_global', true),
            ],
        ]);

        $category = TechStackCategory::create([
            'name' => trim($validated['name']),
            'user_id' => null,
            'is_global' => true,
        ]);

        $this->portfolioService->bumpCatalogVersion();
        $this->clearPortfolioCache($request);
        $this->logService->adminLog('Settings', "Added skill category: {$category->name}");

        return redirect()->back()->with('success', "Skill category \"{$category->name}\" has been added.");
    }

    public function updateCategory(Request $request, TechStackCategory $category): RedirectResponse
    {
        abort_unless($category->is_global, 403, 'Only default categories can be modified here.');

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('tech_stack_categories', 'name')->where('is_global', true)->ignore($category->id),
            ],
        ]);

        $category->update([
            'name' => trim($validated['name']),
        ]);

        $this->portfolioService->bumpCatalogVersion();
        $this->clearPortfolioCache($request);
        $this->logService->adminLog('Settings', "Updated skill category: {$category->name}");

        return redirect()->back()->with('success', "Skill category \"{$category->name}\" has been updated.");
    }

    public function destroyCategory(Request $request, TechStackCategory $category): RedirectResponse
    {
        abort_unless($category->is_global, 403, 'Only default categories can be deleted here.');

        $name = $category->name;
        $category->delete();

        $this->portfolioService->bumpCatalogVersion();
        $this->clearPortfolioCache($request);
        $this->logService->adminLog('Settings', "Deleted skill category: {$name}");

        return redirect()->back()->with('success', "Skill category \"{$name}\" has been deleted.");
    }

    public function storeProjectCategory(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('project_categories', 'name')->where('is_global', true),
            ],
        ]);

        $name = trim($validated['name']);
        $slug = Str::slug($name) ?: Str::lower($name);

        $category = ProjectCategory::create([
            'name' => $name,
            'slug' => $slug,
            'is_global' => true,
            'user_id' => null,
        ]);

        $this->portfolioService->bumpCatalogVersion();
        $this->clearPortfolioCache($request);
        $this->logService->adminLog('Settings', "Added default project category: {$category->name} ({$category->slug})");

        return redirect()->back()->with('success', "Default project category \"{$category->name}\" has been added.");
    }

    public function updateProjectCategory(Request $request, ProjectCategory $projectCategory): RedirectResponse
    {
        if (! $projectCategory->is_global) {
            abort(403, 'Only default project categories can be edited here.');
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('project_categories', 'name')
                    ->where('is_global', true)
                    ->ignore($projectCategory->id),
            ],
        ]);

        $oldSlug = $projectCategory->slug;
        $name = trim($validated['name']);
        $newSlug = Str::slug($name) ?: Str::lower($name);

        $projectCategory->update([
            'name' => $name,
            'slug' => $newSlug,
        ]);

        if ($oldSlug !== $newSlug) {
            Project::where('project_type', $oldSlug)->update(['project_type' => $newSlug]);
        }

        $this->portfolioService->bumpCatalogVersion();
        $this->clearPortfolioCache($request);
        $this->logService->adminLog('Settings', "Updated default project category: {$projectCategory->name} ({$newSlug})");

        return redirect()->back()->with('success', "Default project category \"{$projectCategory->name}\" has been updated.");
    }

    public function destroyProjectCategory(Request $request, ProjectCategory $projectCategory): RedirectResponse
    {
        if (! $projectCategory->is_global) {
            abort(403, 'Only default project categories can be deleted here.');
        }

        $name = $projectCategory->name;
        $slug = $projectCategory->slug;
        $projectCategory->delete();

        $this->portfolioService->bumpCatalogVersion();
        $this->clearPortfolioCache($request);
        $this->logService->adminLog('Settings', "Deleted default project category: {$name} ({$slug})");

        return redirect()->back()->with('success', "Default project category \"{$name}\" has been deleted.");
    }
}

