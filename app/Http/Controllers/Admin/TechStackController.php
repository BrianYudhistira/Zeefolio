<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ResolvesAdminPortfolio;
use App\Http\Controllers\Controller;
use App\Models\TechStack;
use App\Models\TechStackCategory;
use App\Services\LogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TechStackController extends Controller
{
    use ResolvesAdminPortfolio;

    public function __construct(
        protected LogService $logService,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->isAdminOrAbove();

        $techStacks = TechStack::with(['category', 'user:id,name,username'])
            ->availableFor($user)
            ->orderBy('is_global')
            ->orderBy('name')
            ->get();

        $categories = TechStackCategory::withCount([
            'techStacks' => fn ($q) => $q->availableFor($user),
        ])
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/TechStacks/Index', [
            'techStacks' => $techStacks,
            'categories' => $categories,
            'isAdmin' => $isAdmin,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'icon' => ['nullable', 'string', 'max:255'],
            'category_id' => ['nullable', 'exists:tech_stack_categories,id'],
        ]);

        TechStack::create([
            'name' => trim($validated['name']),
            'icon' => $validated['icon'] ?: null,
            'category_id' => $validated['category_id'] ?: null,
            'is_global' => false,
            'user_id' => $user->id,
        ]);

        $this->clearPortfolioCache($request);
        $this->logService->infoLog(
            'Skills',
            "Created custom skill: {$validated['name']}"
        );

        return redirect()->back()->with('success', "Custom skill \"{$validated['name']}\" has been added.");
    }

    public function update(Request $request, TechStack $techStack): RedirectResponse
    {
        $user = $request->user();

        if ($techStack->is_global) {
            abort(403, 'Global skills are managed in Admin Settings.');
        }

        if (! $user->isAdminOrAbove() && $techStack->user_id !== $user->id) {
            abort(403);
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
        ]);

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Skills', "Updated custom skill: {$validated['name']}");

        return redirect()->back()->with('success', "Custom skill \"{$validated['name']}\" has been updated.");
    }

    public function destroy(Request $request, TechStack $techStack): RedirectResponse
    {
        $user = $request->user();

        if ($techStack->is_global) {
            abort(403, 'Global skills are managed in Admin Settings.');
        }

        if (! $user->isAdminOrAbove() && $techStack->user_id !== $user->id) {
            abort(403);
        }

        $name = $techStack->name;
        $techStack->delete();
        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Skills', "Deleted custom skill: {$name}");

        return redirect()->back()->with('success', "Custom skill \"{$name}\" has been deleted.");
    }
}
