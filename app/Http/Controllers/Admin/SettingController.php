<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ResolvesAdminPortfolio;
use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectCategory;
use App\Models\TechStack;
use App\Models\TechStackCategory;
use App\Services\LogService;
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
    ) {}

    public function index(Request $request): Response
    {
        $globalSkills = TechStack::with('category')
            ->where('is_global', true)
            ->orderBy('name')
            ->get();

        $categories = TechStackCategory::withCount([
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

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Skills', "Added global skill: {$skill->name}");

        return redirect()->back()->with('success', "Global skill \"{$skill->name}\" has been added.");
    }

    public function updateGlobalSkill(Request $request, TechStack $techStack): RedirectResponse
    {
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

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Skills', "Updated global skill: {$techStack->name}");

        return redirect()->back()->with('success', "Global skill \"{$techStack->name}\" has been updated.");
    }

    public function destroyGlobalSkill(Request $request, TechStack $techStack): RedirectResponse
    {
        $name = $techStack->name;
        $techStack->delete();

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Skills', "Deleted global skill: {$name}");

        return redirect()->back()->with('success', "Global skill \"{$name}\" has been deleted.");
    }

    public function storeCategory(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', 'unique:tech_stack_categories,name'],
        ]);

        $category = TechStackCategory::create([
            'name' => trim($validated['name']),
        ]);

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Skills', "Added skill category: {$category->name}");

        return redirect()->back()->with('success', "Skill category \"{$category->name}\" has been added.");
    }

    public function updateCategory(Request $request, TechStackCategory $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('tech_stack_categories', 'name')->ignore($category->id),
            ],
        ]);

        $category->update([
            'name' => trim($validated['name']),
        ]);

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Skills', "Updated skill category: {$category->name}");

        return redirect()->back()->with('success', "Skill category \"{$category->name}\" has been updated.");
    }

    public function destroyCategory(Request $request, TechStackCategory $category): RedirectResponse
    {
        $name = $category->name;
        $category->delete();

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Skills', "Deleted skill category: {$name}");

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

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Portfolio', "Added global project category: {$category->name} ({$category->slug})");

        return redirect()->back()->with('success', "Global project category \"{$category->name}\" has been added.");
    }

    public function updateProjectCategory(Request $request, ProjectCategory $projectCategory): RedirectResponse
    {
        if (! $projectCategory->is_global) {
            abort(403, 'Only global project categories can be edited here.');
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

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Portfolio', "Updated global project category: {$projectCategory->name} ({$newSlug})");

        return redirect()->back()->with('success', "Global project category \"{$projectCategory->name}\" has been updated.");
    }

    public function destroyProjectCategory(Request $request, ProjectCategory $projectCategory): RedirectResponse
    {
        if (! $projectCategory->is_global) {
            abort(403, 'Only global project categories can be deleted here.');
        }

        $name = $projectCategory->name;
        $slug = $projectCategory->slug;
        $projectCategory->delete();

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Portfolio', "Deleted global project category: {$name} ({$slug})");

        return redirect()->back()->with('success', "Global project category \"{$name}\" has been deleted.");
    }
}

