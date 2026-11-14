<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ResolvesAdminPortfolio;
use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectCategory;
use App\Models\TechStack;
use App\Services\LogService;
use App\Services\PortfolioService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    use ResolvesAdminPortfolio;

    public function __construct(
        protected PortfolioService $portfolioService,
        protected LogService $logService,
    ) {}

    public function index(Request $request): Response
    {
        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);

        $projects = $portfolio->projects()
            ->with(['techStacks', 'images'])
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get();

        $techStacks = TechStack::with('category')
            ->availableFor($request->user())
            ->orderByDesc('is_global')
            ->orderBy('name')
            ->get();

        $projectCategories = ProjectCategory::availableFor($request->user())
            ->orderByDesc('is_global')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Projects/Index', [
            'projects' => $projects,
            'techStacks' => $techStacks,
            'projectCategories' => $projectCategories,
        ]);
    }

    protected function resolveProjectType(Request $request, ?string $projectType, ?string $customProjectType, string $fallback = 'website'): string
    {
        $customName = trim((string) $customProjectType);

        if ($customName !== '' && ($projectType === '__custom__' || $projectType === null || $projectType === '')) {
            $slug = Str::slug($customName) ?: Str::lower($customName);
            $user = $request->user();

            $category = ProjectCategory::availableFor($user)
                ->where(function ($q) use ($slug, $customName) {
                    $q->where('slug', $slug)
                        ->orWhereRaw('LOWER(name) = ?', [Str::lower($customName)]);
                })
                ->first();

            if (! $category) {
                $category = ProjectCategory::create([
                    'name' => $customName,
                    'slug' => $slug,
                    'is_global' => false,
                    'user_id' => $user?->id,
                ]);
                $this->logService->infoLog('Portfolio', "Created custom project category: {$category->name} ({$category->slug})");
            }

            return $category->slug;
        }

        if ($projectType && $projectType !== '__custom__') {
            return trim($projectType);
        }

        return $fallback;
    }

    public function storeCategory(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
        ]);

        $name = trim($validated['name']);
        $slug = Str::slug($name) ?: Str::lower($name);

        $exists = ProjectCategory::availableFor($user)
            ->where(function ($q) use ($slug, $name) {
                $q->where('slug', $slug)
                    ->orWhereRaw('LOWER(name) = ?', [Str::lower($name)]);
            })
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors([
                'name' => 'This project category already exists.',
            ]);
        }

        $category = ProjectCategory::create([
            'name' => $name,
            'slug' => $slug,
            'is_global' => false,
            'user_id' => $user?->id,
        ]);

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Portfolio', "Added custom project category: {$category->name} ({$category->slug})");

        return redirect()->back()->with('success', "Custom category \"{$category->name}\" has been added.");
    }

    public function updateCategory(Request $request, ProjectCategory $projectCategory): RedirectResponse
    {
        $user = $request->user();

        if ($projectCategory->is_global || $projectCategory->user_id !== $user?->id) {
            abort(403, 'You can only edit your own custom project categories.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
        ]);

        $name = trim($validated['name']);
        $newSlug = Str::slug($name) ?: Str::lower($name);
        $oldSlug = $projectCategory->slug;

        $exists = ProjectCategory::availableFor($user)
            ->where('id', '!=', $projectCategory->id)
            ->where(function ($q) use ($newSlug, $name) {
                $q->where('slug', $newSlug)
                    ->orWhereRaw('LOWER(name) = ?', [Str::lower($name)]);
            })
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors([
                'name' => 'This project category already exists.',
            ]);
        }

        $projectCategory->update([
            'name' => $name,
            'slug' => $newSlug,
        ]);

        if ($oldSlug !== $newSlug) {
            $portfolio = $this->resolvePortfolio($request, $this->portfolioService);
            $portfolio->projects()->where('project_type', $oldSlug)->update(['project_type' => $newSlug]);
        }

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Portfolio', "Updated custom project category: {$projectCategory->name} ({$newSlug})");

        return redirect()->back()->with('success', "Custom category \"{$projectCategory->name}\" has been updated.");
    }

    public function destroyCategory(Request $request, ProjectCategory $projectCategory): RedirectResponse
    {
        $user = $request->user();

        if ($projectCategory->is_global || $projectCategory->user_id !== $user?->id) {
            abort(403, 'You can only delete your own custom project categories.');
        }

        $name = $projectCategory->name;
        $slug = $projectCategory->slug;
        $projectCategory->delete();

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Portfolio', "Deleted custom project category: {$name} ({$slug})");

        return redirect()->back()->with('success', "Custom category \"{$name}\" has been deleted.");
    }

    public function store(Request $request): RedirectResponse
    {
        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:projects,slug'],
            'type' => ['nullable', 'string', 'max:50'],
            'project_type' => ['nullable', 'string', 'max:100'],
            'custom_project_type' => ['nullable', 'string', 'max:50'],
            'description' => ['required', 'string'],
            'demo_url' => ['nullable', 'url', 'max:255'],
            'source_url' => ['nullable', 'url', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'tech_stack_ids' => ['nullable', 'array'],
            'tech_stack_ids.*' => ['integer', 'exists:tech_stacks,id'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
            'showcases' => ['nullable', 'array'],
            'showcases.*.title' => ['nullable', 'string', 'max:255'],
            'showcases.*.description' => ['nullable', 'string', 'max:1000'],
            'showcases.*.new_images' => ['nullable', 'array'],
            'showcases.*.new_images.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
        ]);

        $slug = ! empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['title']).'-'.Str::lower(Str::random(4));

        $disk = Storage::disk('public');
        $newFiles = [];
        $oldFilesToDelete = [];

        DB::beginTransaction();

        try {
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('portfolios/projects', 'public');
                if ($imagePath) {
                    $newFiles[] = $imagePath;
                }
            }

            $techStackIds = $validated['tech_stack_ids'] ?? [];
            $techStackNames = TechStack::whereIn('id', $techStackIds)->pluck('name')->values()->all();

            $resolvedProjectType = $this->resolveProjectType(
                $request,
                $validated['project_type'] ?? null,
                $validated['custom_project_type'] ?? null,
                'website'
            );

            $project = $portfolio->projects()->create([
                'title' => $validated['title'],
                'slug' => $slug,
                'type' => $validated['type'] ?? 'personal',
                'project_type' => $resolvedProjectType,
                'description' => $validated['description'],
                'demo_url' => $validated['demo_url'] ?? null,
                'source_url' => $validated['source_url'] ?? null,
                'sort_order' => $validated['sort_order'] ?? 0,
                'is_featured' => (bool) ($validated['is_featured'] ?? false),
                'is_active' => (bool) ($validated['is_active'] ?? true),
                'image_path' => $imagePath,
                'tech_stack' => $techStackNames,
            ]);

            $syncPayload = [];
            foreach (array_values($techStackIds) as $index => $tsId) {
                $syncPayload[$tsId] = ['sort_order' => $index];
            }
            $project->techStacks()->sync($syncPayload);

            $this->syncProjectShowcases($request, $project, $newFiles, $oldFilesToDelete);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();

            foreach ($newFiles as $newFile) {
                $disk->delete($newFile);
            }

            throw $e;
        }

        foreach ($oldFilesToDelete as $oldFile) {
            $disk->delete($oldFile);
        }

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Portfolio', "Created project: {$project->title}");

        return redirect()->back()->with('success', "Project \"{$project->title}\" has been created.");
    }

    public function update(Request $request, Project $project): RedirectResponse
    {
        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);

        if ($project->portfolio_user_id !== $portfolio->id) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('projects', 'slug')->ignore($project->id)],
            'type' => ['nullable', 'string', 'max:50'],
            'project_type' => ['nullable', 'string', 'max:100'],
            'custom_project_type' => ['nullable', 'string', 'max:50'],
            'description' => ['required', 'string'],
            'demo_url' => ['nullable', 'url', 'max:255'],
            'source_url' => ['nullable', 'url', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'tech_stack_ids' => ['nullable', 'array'],
            'tech_stack_ids.*' => ['integer', 'exists:tech_stacks,id'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
            'showcases' => ['nullable', 'array'],
            'showcases.*.id' => ['nullable', 'integer'],
            'showcases.*.title' => ['nullable', 'string', 'max:255'],
            'showcases.*.description' => ['nullable', 'string', 'max:1000'],
            'showcases.*.existing_images' => ['nullable', 'array'],
            'showcases.*.existing_images.*' => ['nullable', 'string'],
            'showcases.*.new_images' => ['nullable', 'array'],
            'showcases.*.new_images.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
        ]);

        $slug = ! empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : ($project->slug ?: Str::slug($validated['title']).'-'.Str::lower(Str::random(4)));

        $disk = Storage::disk('public');
        $newFiles = [];
        $oldFilesToDelete = [];

        DB::beginTransaction();

        try {
            $oldImagePath = $project->getRawOriginal('image_path');
            $imagePath = $oldImagePath;

            if ($request->hasFile('image')) {
                $uploadedCover = $request->file('image')->store('portfolios/projects', 'public');
                if (! $uploadedCover) {
                    throw new \RuntimeException('Failed to store uploaded project cover image.');
                }

                $newFiles[] = $uploadedCover;
                if ($oldImagePath && is_string($oldImagePath) && ! str_starts_with($oldImagePath, 'http')) {
                    $oldFilesToDelete[] = $oldImagePath;
                }
                $imagePath = $uploadedCover;
            }

            $techStackIds = $validated['tech_stack_ids'] ?? [];
            $techStackNames = TechStack::whereIn('id', $techStackIds)->pluck('name')->values()->all();

            $resolvedProjectType = $this->resolveProjectType(
                $request,
                $validated['project_type'] ?? null,
                $validated['custom_project_type'] ?? null,
                $project->project_type ?: 'website'
            );

            $project->update([
                'title' => $validated['title'],
                'slug' => $slug,
                'type' => $validated['type'] ?? $project->type ?? 'personal',
                'project_type' => $resolvedProjectType,
                'description' => $validated['description'],
                'demo_url' => $validated['demo_url'] ?? null,
                'source_url' => $validated['source_url'] ?? null,
                'sort_order' => $validated['sort_order'] ?? 0,
                'is_featured' => (bool) ($validated['is_featured'] ?? false),
                'is_active' => (bool) ($validated['is_active'] ?? true),
                'image_path' => $imagePath,
                'tech_stack' => $techStackNames,
            ]);

            $syncPayload = [];
            foreach (array_values($techStackIds) as $index => $tsId) {
                $syncPayload[$tsId] = ['sort_order' => $index];
            }
            $project->techStacks()->sync($syncPayload);

            $this->syncProjectShowcases($request, $project, $newFiles, $oldFilesToDelete);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();

            foreach ($newFiles as $newFile) {
                $disk->delete($newFile);
            }

            throw $e;
        }

        foreach (array_unique($oldFilesToDelete) as $oldFile) {
            if ($oldFile && is_string($oldFile)) {
                $disk->delete($oldFile);
            }
        }

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Portfolio', "Updated project: {$project->title}");

        return redirect()->back()->with('success', "Project \"{$project->title}\" has been updated.");
    }

    public function destroy(Request $request, Project $project): RedirectResponse
    {
        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);

        if ($project->portfolio_user_id !== $portfolio->id) {
            abort(403);
        }

        $oldFilesToDelete = [];

        $rawImage = $project->getRawOriginal('image_path');
        if ($rawImage && is_string($rawImage) && ! str_starts_with($rawImage, 'http')) {
            $oldFilesToDelete[] = $rawImage;
        }

        foreach ($project->images as $showcase) {
            foreach ((array) $showcase->image_path as $path) {
                if ($path && is_string($path) && ! str_starts_with($path, 'http')) {
                    $oldFilesToDelete[] = $path;
                }
            }
        }

        $title = $project->title;

        DB::beginTransaction();

        try {
            $project->images()->delete();
            $project->techStacks()->detach();
            $project->delete();

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }

        $disk = Storage::disk('public');
        foreach (array_unique($oldFilesToDelete) as $filePath) {
            $disk->delete($filePath);
        }

        $this->clearPortfolioCache($request);
        $this->logService->infoLog('Portfolio', "Deleted project: {$title}");

        return redirect()->back()->with('success', "Project \"{$title}\" has been deleted.");
    }

    /**
     * @param  list<string>  $newFiles
     * @param  list<string>  $oldFilesToDelete
     */
    protected function syncProjectShowcases(Request $request, Project $project, array &$newFiles = [], array &$oldFilesToDelete = []): void
    {
        $existingShowcases = $project->images()->get()->keyBy('id');
        $submittedShowcases = $request->input('showcases', []);

        if (! is_array($submittedShowcases)) {
            $submittedShowcases = [];
        }

        $keptIds = [];

        foreach ($submittedShowcases as $index => $item) {
            $existingPaths = isset($item['existing_images']) && is_array($item['existing_images'])
                ? array_values(array_filter($item['existing_images'], fn ($p) => is_string($p) && trim($p) !== ''))
                : [];

            $uploadedFiles = $request->file("showcases.{$index}.new_images", []);
            $newPaths = [];

            if (is_array($uploadedFiles)) {
                foreach ($uploadedFiles as $file) {
                    if ($file instanceof UploadedFile) {
                        $stored = $file->store('portfolios/projects', 'public');
                        if ($stored) {
                            $newPaths[] = $stored;
                            $newFiles[] = $stored;
                        }
                    }
                }
            }

            $finalPaths = array_values(array_merge($existingPaths, $newPaths));
            $title = isset($item['title']) ? trim((string) $item['title']) : null;
            $description = isset($item['description']) ? trim((string) $item['description']) : null;

            if (empty($finalPaths) && empty($title) && empty($description)) {
                continue;
            }

            $showcaseId = isset($item['id']) ? (int) $item['id'] : null;

            if ($showcaseId && $existingShowcases->has($showcaseId)) {
                $showcaseModel = $existingShowcases->get($showcaseId);
                $keptIds[] = $showcaseId;

                $oldPaths = is_array($showcaseModel->image_path)
                    ? $showcaseModel->image_path
                    : ($showcaseModel->image_path ? [$showcaseModel->image_path] : []);

                foreach ($oldPaths as $oldPath) {
                    if ($oldPath && is_string($oldPath) && ! in_array($oldPath, $existingPaths, true) && ! str_starts_with($oldPath, 'http')) {
                        $oldFilesToDelete[] = $oldPath;
                    }
                }

                $showcaseModel->update([
                    'title' => $title ?: null,
                    'description' => $description ?: null,
                    'image_path' => $finalPaths,
                ]);
            } else {
                $created = $project->images()->create([
                    'title' => $title ?: null,
                    'description' => $description ?: null,
                    'image_path' => $finalPaths,
                ]);
                $keptIds[] = $created->id;
            }
        }

        foreach ($existingShowcases as $oldId => $oldShowcase) {
            if (! in_array($oldId, $keptIds, true)) {
                $oldPaths = is_array($oldShowcase->image_path)
                    ? $oldShowcase->image_path
                    : ($oldShowcase->image_path ? [$oldShowcase->image_path] : []);

                foreach ($oldPaths as $oldPath) {
                    if ($oldPath && is_string($oldPath) && ! str_starts_with($oldPath, 'http')) {
                        $oldFilesToDelete[] = $oldPath;
                    }
                }

                $oldShowcase->delete();
            }
        }
    }
}
