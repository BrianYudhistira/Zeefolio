<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ResolvesAdminPortfolio;
use App\Http\Controllers\Controller;
use App\Models\TechStack;
use App\Models\TechStackCategory;
use App\Models\User;
use App\Models\UserSkills;
use App\Services\LogService;
use App\Services\PortfolioService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SkillController extends Controller
{
    use ResolvesAdminPortfolio;

    public function __construct(
        protected PortfolioService $portfolioService,
        protected LogService $logService,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);

        $skills = $portfolio->userSkills()
            ->with('techStack.category')
            ->orderByDesc('proficiency_level')
            ->get();

        $techStacks = TechStack::with('category')
            ->availableFor($user)
            ->orderByDesc('is_global')
            ->orderBy('name')
            ->get();

        $categories = TechStackCategory::availableFor($user)
            ->orderBy('name')
            ->get();

        $savedCategoryIds = is_array($portfolio->skill_categories)
            ? array_values(array_filter(array_map('intval', $portfolio->skill_categories)))
            : [];

        $validCategoryIds = $categories->pluck('id')->all();
        $selectedCategoryIds = array_values(array_intersect($savedCategoryIds, $validCategoryIds));

        if (empty($selectedCategoryIds)) {
            $selectedCategoryIds = $skills
                ->map(fn ($skill) => $skill->techStack?->category_id)
                ->filter()
                ->unique()
                ->take(3)
                ->values()
                ->all();

            if (empty($selectedCategoryIds) && $categories->isNotEmpty()) {
                $selectedCategoryIds = $categories->take(3)->pluck('id')->all();
            }
        }

        return Inertia::render('Admin/Skills/Index', [
            'skills' => $skills,
            'techStacks' => $techStacks,
            'categories' => $categories,
            'selectedCategoryIds' => array_slice($selectedCategoryIds, 0, 4),
        ]);
    }

    public function updateCategories(Request $request): RedirectResponse
    {
        $user = $request->user();
        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);

        $validated = $request->validate([
            'skill_categories' => ['required', 'array', 'min:1', 'max:4'],
            'skill_categories.*' => [
                'required',
                'integer',
                'distinct',
                TechStackCategory::availableExistsRule($user),
            ],
        ]);

        $categoryIds = array_values(array_map('intval', $validated['skill_categories']));

        $portfolio->update([
            'skill_categories' => $categoryIds,
        ]);

        $categoryNames = TechStackCategory::whereIn('id', $categoryIds)->pluck('name')->implode(', ');
        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Skills', "Updated portfolio skill display categories: {$categoryNames}");

        return redirect()->back()->with('success', 'Portfolio skill categories updated successfully.');
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);

        $mode = $request->input('mode', 'existing');

        if ($mode === 'custom') {
            $validated = $request->validate([
                'custom_name' => ['required', 'string', 'max:100'],
                'icon' => ['nullable', 'string', 'max:255'],
                'category_id' => ['nullable', TechStackCategory::availableExistsRule($user)],
                'custom_category' => ['nullable', 'string', 'max:50'],
                'proficiency_level' => ['required', 'integer', 'min:1', 'max:5'],
                'is_global' => ['sometimes', 'boolean'],
            ]);

            $makeGlobal = $user->isAdminOrAbove() && ($validated['is_global'] ?? false);
            $resolvedCategoryId = $this->resolveSkillCategoryId(
                $user,
                $validated['custom_category'] ?? null,
                $validated['category_id'] ?? null,
                $makeGlobal,
            );

            $techStack = TechStack::firstOrCreate(
                [
                    'name' => trim($validated['custom_name']),
                    'user_id' => $makeGlobal ? null : $user->id,
                    'is_global' => $makeGlobal,
                ],
                [
                    'icon' => ($validated['icon'] ?? '') !== '' ? trim((string) $validated['icon']) : null,
                    'category_id' => $resolvedCategoryId,
                ]
            );

            $techStackId = $techStack->id;
            $proficiencyLevel = $validated['proficiency_level'];
        } else {
            $validated = $request->validate([
                'tech_stack_id' => ['required', 'exists:tech_stacks,id'],
                'proficiency_level' => ['required', 'integer', 'min:1', 'max:5'],
            ]);

            $techStack = TechStack::availableFor($user)->findOrFail($validated['tech_stack_id']);
            $techStackId = $techStack->id;
            $proficiencyLevel = $validated['proficiency_level'];
        }

        $exists = $portfolio->userSkills()
            ->where('tech_stack_id', $techStackId)
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors([
                'tech_stack_id' => 'This skill is already in your active skills list.',
            ]);
        }

        $portfolio->userSkills()->create([
            'tech_stack_id' => $techStackId,
            'proficiency_level' => $proficiencyLevel,
        ]);

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Skills', "Added skill: {$techStack->name}");

        return redirect()->back()->with('success', "Skill \"{$techStack->name}\" has been added.");
    }

    public function update(Request $request, UserSkills $skill): RedirectResponse
    {
        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);

        if ($skill->portfolio_user_id !== $portfolio->id) {
            abort(403);
        }

        $validated = $request->validate([
            'proficiency_level' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        $skillName = $skill->techStack?->name ?? "#{$skill->id}";
        $skill->update($validated);
        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Skills', "Updated skill: {$skillName} (Level {$validated['proficiency_level']})");

        return redirect()->back()->with('success', "Skill \"{$skillName}\" level updated.");
    }

    public function destroy(Request $request, UserSkills $skill): RedirectResponse
    {
        $user = $request->user();
        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);

        if ($skill->portfolio_user_id !== $portfolio->id) {
            abort(403);
        }

        $techStack = $skill->techStack;
        $skillName = $techStack?->name ?? "#{$skill->id}";
        $skill->delete();

        // Clean up the underlying custom TechStack if owned by this user and no longer referenced anywhere.
        if (
            $techStack &&
            ! $techStack->is_global &&
            $techStack->user_id === $user->id &&
            ! UserSkills::where('tech_stack_id', $techStack->id)->exists() &&
            ! $techStack->projects()->exists()
        ) {
            $techStack->delete();
        }

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Skills', "Deleted skill: {$skillName}");

        return redirect()->back()->with('success', "Skill \"{$skillName}\" has been removed.");
    }

    protected function resolveSkillCategoryId(
        User $user,
        ?string $customCategory,
        mixed $categoryId,
        bool $makeGlobal = false,
    ): ?int {
        $customCategoryName = trim((string) $customCategory);

        if ($customCategoryName !== '') {
            return TechStackCategory::findOrCreateForUser($user, $customCategoryName, $makeGlobal)->id;
        }

        return $categoryId ? (int) $categoryId : null;
    }

    public function storeCustomCategory(Request $request): RedirectResponse
    {
        $user = $request->user();
        $name = $this->validateCustomCategoryName($request, $user);

        $category = TechStackCategory::create([
            'name' => $name,
            'user_id' => $user->id,
            'is_global' => false,
        ]);

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Skills', "Added custom skill category: {$category->name}");

        return redirect()->back()->with('success', "Custom category \"{$category->name}\" has been added.");
    }

    public function updateCustomCategory(Request $request, TechStackCategory $category): RedirectResponse
    {
        $user = $request->user();
        abort_if($category->is_global || $category->user_id !== $user->id, 403, 'You can only edit your own custom categories.');

        $name = $this->validateCustomCategoryName($request, $user, $category->id);
        $category->update(['name' => $name]);

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Skills', "Updated custom skill category: {$category->name}");

        return redirect()->back()->with('success', "Custom category renamed to \"{$category->name}\".");
    }

    public function destroyCustomCategory(Request $request, TechStackCategory $category): RedirectResponse
    {
        $user = $request->user();
        abort_if($category->is_global || $category->user_id !== $user->id, 403, 'You can only delete your own custom categories.');

        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);
        $name = $category->name;
        $categoryId = $category->id;
        $currentCategoryIds = is_array($portfolio->skill_categories)
            ? array_values(array_map('intval', $portfolio->skill_categories))
            : [];

        if (in_array($categoryId, $currentCategoryIds, true)) {
            $portfolio->update([
                'skill_categories' => array_values(array_filter(
                    $currentCategoryIds,
                    fn (int $id) => $id !== $categoryId,
                )),
            ]);
        }

        $category->delete();

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Skills', "Deleted custom skill category: {$name}");

        return redirect()->back()->with('success', "Custom category \"{$name}\" has been deleted.");
    }

    protected function validateCustomCategoryName(Request $request, User $user, ?int $ignoreCategoryId = null): string
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
        ]);

        $name = trim($validated['name']);

        $duplicate = TechStackCategory::availableFor($user)
            ->when($ignoreCategoryId, fn ($q) => $q->where('id', '!=', $ignoreCategoryId))
            ->whereRaw('LOWER(name) = ?', [Str::lower($name)])
            ->exists();

        if ($duplicate) {
            throw ValidationException::withMessages([
                'name' => 'This skill category already exists.',
            ]);
        }

        return $name;
    }
}
