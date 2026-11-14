<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ResolvesAdminPortfolio;
use App\Http\Controllers\Controller;
use App\Models\Experience;
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

        $experiences = $portfolio->experiences()
            ->orderBy('sort_order')
            ->orderByDesc('start_date')
            ->get();

        return Inertia::render('Admin/Experiences/Index', [
            'experiences' => $experiences,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);

        $validated = $request->validate([
            'company' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'description' => ['required', 'string'],
            'tech_stack' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        if (! isset($validated['sort_order'])) {
            $maxOrder = $portfolio->experiences()->max('sort_order');
            $validated['sort_order'] = is_null($maxOrder) ? 0 : ((int) $maxOrder + 1);
        }

        $portfolio->experiences()->create($validated);
        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Portfolio', "Added experience at {$validated['company']}");

        return redirect()->back()->with('success', 'Experience added successfully.');
    }

    public function update(Request $request, Experience $experience): RedirectResponse
    {
        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);

        if ($experience->portfolio_user_id !== $portfolio->id) {
            abort(403);
        }

        $validated = $request->validate([
            'company' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'description' => ['required', 'string'],
            'tech_stack' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        if (! isset($validated['sort_order'])) {
            $validated['sort_order'] = $experience->sort_order ?? 0;
        }

        $experience->update($validated);
        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Portfolio', "Updated experience at {$validated['company']}");

        return redirect()->back()->with('success', 'Experience updated successfully.');
    }

    public function move(Request $request, Experience $experience): RedirectResponse
    {
        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);

        if ($experience->portfolio_user_id !== $portfolio->id) {
            abort(403);
        }

        $validated = $request->validate([
            'direction' => ['required', Rule::in(['up', 'down'])],
        ]);

        $ordered = $portfolio->experiences()
            ->orderBy('sort_order')
            ->orderByDesc('start_date')
            ->get()
            ->values();

        $currentIndex = $ordered->search(fn (Experience $item) => $item->id === $experience->id);

        if ($currentIndex === false) {
            return redirect()->back();
        }

        $targetIndex = $validated['direction'] === 'up' ? $currentIndex - 1 : $currentIndex + 1;

        if ($targetIndex < 0 || $targetIndex >= $ordered->count()) {
            return redirect()->back();
        }

        DB::transaction(function () use ($ordered, $currentIndex, $targetIndex) {
            $items = $ordered->all();
            $temp = $items[$currentIndex];
            $items[$currentIndex] = $items[$targetIndex];
            $items[$targetIndex] = $temp;

            foreach ($items as $order => $item) {
                if ((int) $item->sort_order !== $order) {
                    $item->update(['sort_order' => $order]);
                }
            }
        });

        $this->clearPortfolioCache($request);
        $this->logService->infoLog(
            'Portfolio',
            "Moved experience \"{$experience->position}\" at {$experience->company} {$validated['direction']}"
        );

        return redirect()->back()->with('success', "Experience order updated for \"{$experience->position}\".");
    }

    public function destroy(Request $request, Experience $experience): RedirectResponse
    {
        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);

        if ($experience->portfolio_user_id !== $portfolio->id) {
            abort(403);
        }

        $company = $experience->company;
        $experience->delete();
        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Portfolio', "Deleted experience at {$company}");

        return redirect()->back()->with('success', 'Experience deleted successfully.');
    }
}
