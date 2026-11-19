<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ResolvesAdminPortfolio;
use App\Http\Controllers\Controller;
use App\Models\Experience;
use App\Models\PortfolioUser;
use App\Models\TechStack;
use App\Services\LogService;
use App\Services\PortfolioService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ExperienceController extends Controller
{
    use ResolvesAdminPortfolio;

    public function __construct(
        protected PortfolioService $portfolioService,
        protected LogService $logService,
    ) {}

    public function index(Request $request): Response
    {
        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);

        return Inertia::render('Admin/Experiences/Index', [
            'experiences' => $portfolio->experiences()->get(),
            'skills' => $this->formatSkillOptions($portfolio),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);
        $validated = $this->validateExperiencePayload($request, $portfolio);

        return $this->saveAndReindexExperiences(
            $request,
            $portfolio,
            fn () => $portfolio->experiences()->create($validated),
            "Added experience at {$validated['company']}",
            'Experience added successfully.',
        );
    }

    public function update(Request $request, Experience $experience): RedirectResponse
    {
        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);
        abort_if($experience->portfolio_user_id !== $portfolio->id, 403);

        $validated = $this->validateExperiencePayload($request, $portfolio);

        return $this->saveAndReindexExperiences(
            $request,
            $portfolio,
            fn () => $experience->update($validated),
            "Updated experience at {$validated['company']}",
            'Experience updated successfully.',
        );
    }

    public function destroy(Request $request, Experience $experience): RedirectResponse
    {
        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);
        abort_if($experience->portfolio_user_id !== $portfolio->id, 403);

        $company = $experience->company;

        return $this->saveAndReindexExperiences(
            $request,
            $portfolio,
            fn () => $experience->delete(),
            "Deleted experience at {$company}",
            'Experience deleted successfully.',
        );
    }

    /**
     * Run a write operation, re-index sort_order, clear portfolio cache, and log the change.
     */
    protected function saveAndReindexExperiences(
        Request $request,
        PortfolioUser $portfolio,
        callable $operation,
        string $logMessage,
        string $flashMessage,
    ): RedirectResponse {
        DB::transaction(function () use ($portfolio, $operation): void {
            $operation();
            $this->syncSortOrderByStartDate($portfolio);
        });

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Portfolio', $logMessage);

        return redirect()->back()->with('success', $flashMessage);
    }

    /**
     * Format the user's configured skills as sorted selectable options.
     *
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
     */
    protected function formatSkillOptions(PortfolioUser $portfolio)
    {
        return $portfolio->userSkills()
            ->with('techStack.category')
            ->get()
            ->map(fn ($userSkill) => $userSkill->techStack)
            ->filter()
            ->unique('id')
            ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
            ->map(fn (TechStack $stack) => [
                'id' => $stack->id,
                'name' => $stack->name,
                'icon' => $stack->icon,
                'category' => $stack->category?->name,
            ])
            ->values();
    }

    /**
     * Validate experience input and resolve selected user skill IDs into stored skill names.
     *
     * @return array<string, mixed>
     */
    protected function validateExperiencePayload(Request $request, PortfolioUser $portfolio): array
    {
        $validated = $request->validate([
            'company' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'description' => ['required', 'string'],
            'tech_stack' => ['nullable', 'string', 'max:500'],
            'skill_ids' => ['nullable', 'array'],
            'skill_ids.*' => [
                'integer',
                Rule::exists('user_skills', 'tech_stack_id')->where('portfolio_user_id', $portfolio->id),
            ],
        ]);

        if ($request->has('skill_ids')) {
            $validated['tech_stack'] = $this->resolveSkillNames($portfolio, $validated['skill_ids'] ?? []);
        }

        unset($validated['skill_ids']);

        return $validated;
    }

    /**
     * Resolve selected user skill IDs into a comma-separated list of skill names.
     *
     * @param array<int, int|string> $rawSkillIds
     */
    protected function resolveSkillNames(PortfolioUser $portfolio, array $rawSkillIds): ?string
    {
        $skillIds = array_values(array_unique(array_map('intval', $rawSkillIds)));

        if (empty($skillIds)) {
            return null;
        }

        $stacksById = $portfolio->userSkills()
            ->whereIn('tech_stack_id', $skillIds)
            ->with('techStack:id,name')
            ->get()
            ->pluck('techStack')
            ->filter()
            ->keyBy('id');

        $resolvedNames = collect($skillIds)
            ->map(fn (int $id) => $stacksById->get($id)?->name)
            ->filter()
            ->values()
            ->implode(', ');

        return $resolvedNames !== '' ? $resolvedNames : null;
    }

    /**
     * Recompute sort_order automatically from newest start_date to oldest.
     */
    protected function syncSortOrderByStartDate(PortfolioUser $portfolio): void
    {
        $ordered = $portfolio->experiences()
            ->reorder()
            ->orderByDesc('start_date')
            ->orderByDesc('id')
            ->get(['id', 'sort_order']);

        foreach ($ordered as $order => $item) {
            if ((int) $item->sort_order !== $order) {
                $item->update(['sort_order' => $order]);
            }
        }
    }
}
