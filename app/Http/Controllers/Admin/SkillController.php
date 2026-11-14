<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ResolvesAdminPortfolio;
use App\Http\Controllers\Controller;
use App\Models\TechStack;
use App\Models\TechStackCategory;
use App\Models\UserSkills;
use App\Services\LogService;
use App\Services\PortfolioService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
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
        $this->ensureSkillCategoriesColumn();

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

        $categories = TechStackCategory::orderBy('name')->get();

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
        $this->ensureSkillCategoriesColumn();

        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);

        $validated = $request->validate([
            'skill_categories' => ['required', 'array', 'min:1', 'max:4'],
            'skill_categories.*' => ['required', 'integer', 'distinct', 'exists:tech_stack_categories,id'],
        ]);

        $categoryIds = array_values(array_map('intval', $validated['skill_categories']));

        DB::beginTransaction();

        try {
            $portfolio->update([
                'skill_categories' => $categoryIds,
            ]);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }

        $categoryNames = TechStackCategory::whereIn('id', $categoryIds)->pluck('name')->implode(', ');
        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Skills', "Updated portfolio skill display categories: {$categoryNames}");

        return redirect()->back()->with('success', 'Portfolio skill categories updated successfully.');
    }

    protected function ensureSkillCategoriesColumn(): void
    {
        if (! Schema::hasColumn('portfolio_users', 'skill_categories')) {
            Schema::table('portfolio_users', function (Blueprint $table) {
                $table->json('skill_categories')->nullable()->after('sections');
            });
        }
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
                'category_id' => ['nullable', 'exists:tech_stack_categories,id'],
                'proficiency_level' => ['required', 'integer', 'min:1', 'max:5'],
                'is_global' => ['sometimes', 'boolean'],
            ]);

            $makeGlobal = $user->isAdminOrAbove() && ($validated['is_global'] ?? false);

            $techStack = TechStack::firstOrCreate(
                [
                    'name' => trim($validated['custom_name']),
                    'user_id' => $makeGlobal ? null : $user->id,
                    'is_global' => $makeGlobal,
                ],
                [
                    'icon' => $validated['icon'] ?? null,
                    'category_id' => $validated['category_id'] ?? null,
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
        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);

        if ($skill->portfolio_user_id !== $portfolio->id) {
            abort(403);
        }

        $skillName = $skill->techStack?->name ?? "#{$skill->id}";
        $skill->delete();
        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Skills', "Deleted skill: {$skillName}");

        return redirect()->back()->with('success', "Skill \"{$skillName}\" has been removed.");
    }
}
