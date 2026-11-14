<?php

namespace App\Services;

use App\Models\Contact;
use App\Models\Home;
use App\Models\PortfolioUser;
use App\Models\Project;
use App\Models\TechStack;
use App\Models\TechStackCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PortfolioService
{
    /**
     * Get portfolio by user ID (cached for 1 hour to reduce DB queries).
     */
    public function getPortfolio(User $user): ?PortfolioUser
    {
        $cacheKey = "portfolio:user:{$user->id}";

        return Cache::remember($cacheKey, 3600, function () use ($user) {
            return $user->portfolioUser()
                ->with([
                    'home',
                    'userSkills.techStack.category',
                    'projects.techStacks',
                    'projects.images',
                    'contacts',
                    'experiences',
                ])
                ->first();
        });
    }

    /**
     * Get public portfolio with resolved experience tech stacks by user ID.
     */
    public function getPublicPortfolio(int $userId = 1): ?PortfolioUser
    {
        $user = User::findOrFail($userId);
        $portfolio = $this->getPortfolio($user);

        return $this->hydrateExperienceTechStacks($portfolio);
    }

    /**
     * Get public portfolio by portfolio slug (or fallback to user username).
     */
    public function getPublicPortfolioBySlug(string $slug): ?PortfolioUser
    {
        $portfolioRecord = PortfolioUser::where('slug', $slug)->first();

        if (! $portfolioRecord) {
            $user = User::where('username', $slug)->first();
            if (! $user) {
                return null;
            }
            $portfolioRecord = $user->portfolioUser()->first() ?? $this->createDefaultPortfolio($user);
        }

        return $this->getPublicPortfolio($portfolioRecord->user_id);
    }

    /**
     * Resolve experience tech stack icons on a portfolio instance.
     */
    protected function hydrateExperienceTechStacks(?PortfolioUser $portfolio): ?PortfolioUser
    {
        if ($portfolio && $portfolio->experiences) {
            $allTechStacks = TechStack::all()->keyBy(
                fn (TechStack $item) => Str::lower(trim($item->name))
            );

            foreach ($portfolio->experiences as $experience) {
                $rawList = array_filter(array_map('trim', explode(',', $experience->tech_stack ?? '')));
                $resolved = [];

                foreach ($rawList as $techName) {
                    $matched = $allTechStacks->get(Str::lower($techName));
                    $resolved[] = [
                        'name' => $techName,
                        'icon' => $matched?->icon,
                    ];
                }

                $experience->tech_stacks = $resolved;
            }
        }

        if ($portfolio) {
            $rawCategories = PortfolioUser::whereKey($portfolio->id)->value('skill_categories')
                ?? $portfolio->skill_categories;

            if (is_string($rawCategories)) {
                $rawCategories = json_decode($rawCategories, true);
            }

            $savedCategoryIds = is_array($rawCategories)
                ? array_values(array_filter(array_map('intval', $rawCategories)))
                : [];

            $portfolio->skill_categories = $savedCategoryIds;

            if (! empty($savedCategoryIds)) {
                $categoriesById = TechStackCategory::whereIn('id', $savedCategoryIds)
                    ->get()
                    ->keyBy('id');

                $portfolio->selected_skill_categories = collect($savedCategoryIds)
                    ->map(fn (int $id) => $categoriesById->get($id))
                    ->filter()
                    ->take(4)
                    ->map(fn (TechStackCategory $cat) => [
                        'id' => $cat->id,
                        'name' => $cat->name,
                    ])
                    ->values()
                    ->all();
            } else {
                $portfolio->selected_skill_categories = [];
            }
        }

        return $portfolio;
    }

    /**
     * List projects ordered deterministically (scoped to a portfolio when provided).
     */
    public function listProjects(?PortfolioUser $portfolio = null): Collection
    {
        $query = $portfolio
            ? $portfolio->projects()
            : Project::query();

        return $query->with(['techStacks', 'images'])
            ->orderBy('sort_order', 'asc')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();
    }

    /**
     * Get single project by slug (scoped to a portfolio when provided).
     */
    public function getProjectBySlug(string $slug, ?PortfolioUser $portfolio = null): ?Project
    {
        $query = $portfolio
            ? $portfolio->projects()
            : Project::query();

        return $query->with(['techStacks', 'images', 'portfolioUser'])
            ->where('slug', $slug)
            ->first();
    }

    /**
     * Initialize a default portfolio for the given user.
     */
    public function createDefaultPortfolio(User $user): PortfolioUser
    {
        return DB::transaction(function () use ($user) {
            $baseSlug = Str::slug($user->username ?: $user->name) ?: 'user-'.$user->id;
            $slug = PortfolioUser::where('slug', $baseSlug)->exists()
                ? $baseSlug.'-'.Str::lower(Str::random(4))
                : $baseSlug;

            $portfolio = $user->portfolioUser()->create([
                'sections' => ['home', 'about', 'projects', 'contact'],
                'theme' => 'default',
                'slug' => $slug,
                'is_active' => true,
            ]);

            $portfolio->home()->create([
                'greeting' => 'Hello, I am',
                'name' => $user->name,
                'passions' => [],
                'description' => 'A brief description about yourself.',
                'logo_path' => null,
                'image_path' => null,
                'cv_path' => null,
                'social_media_links' => [],
            ]);

            $portfolio->contacts()->create([
                'email' => $user->email,
                'phone' => null,
                'address' => null,
            ]);

            $this->clearPortfolioCache($user->id);

            return $portfolio->load(['home', 'contacts']);
        });
    }

    /**
     * Update home section (including profile image, CV, and logo).
     */
    public function editHomeSection(User $user, array $data): ?Home
    {
        $portfolio = $user->portfolioUser()->first();

        if (! $portfolio) {
            return null;
        }

        $disk = Storage::disk('public');
        $newFiles = [];
        $oldFiles = [];

        DB::beginTransaction();

        try {
            $homeSection = $portfolio->home()->firstOrNew();
            $homeSection->fill(collect($data)->only([
                'greeting',
                'name',
                'passions',
                'description',
                'social_media_links',
            ])->filter(fn ($value) => $value !== null)->all());

            foreach ([
                'logo' => ['column' => 'logo_path', 'directory' => 'portfolios/logos'],
                'image' => ['column' => 'image_path', 'directory' => 'portfolios/images'],
                'cv' => ['column' => 'cv_path', 'directory' => 'portfolios/cvs'],
            ] as $input => $fileConfig) {
                if (! isset($data[$input]) || ! $data[$input] instanceof UploadedFile) {
                    continue;
                }

                $column = $fileConfig['column'];
                $oldFiles[] = $homeSection->getRawOriginal($column) ?? $homeSection->{$column};
                $newPath = $data[$input]->store($fileConfig['directory'], 'public');

                if (! $newPath) {
                    throw new \RuntimeException("Failed to store {$input} file.");
                }

                $newFiles[] = $newPath;
                $homeSection->{$column} = $newPath;
            }

            $homeSection->save();
            DB::commit();
        } catch (\Throwable $exception) {
            DB::rollBack();

            foreach ($newFiles as $newFile) {
                $disk->delete($newFile);
            }

            throw $exception;
        }

        foreach ($oldFiles as $oldFile) {
            if ($oldFile && is_string($oldFile) && ! str_starts_with($oldFile, 'http')) {
                $disk->delete($oldFile);
            }
        }

        $this->clearPortfolioCache($user->id);

        return $homeSection->fresh();
    }

    /**
     * Update contacts section.
     */
    public function editContactsSection(User $user, array $data): ?Contact
    {
        $portfolio = $user->portfolioUser()->first();

        if (! $portfolio) {
            return null;
        }

        DB::beginTransaction();

        try {
            $contact = $portfolio->contacts()->updateOrCreate(
                ['portfolio_user_id' => $portfolio->id],
                collect($data)->only(['email', 'phone', 'address'])->all()
            );

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }

        $this->clearPortfolioCache($user->id);

        return $contact;
    }

    /**
     * Collect all storage file paths associated with a portfolio (home, projects, showcases).
     *
     * @return list<string>
     */
    public function collectPortfolioFilePaths(PortfolioUser $portfolio): array
    {
        $paths = [];

        if ($portfolio->home) {
            foreach (['logo_path', 'image_path', 'cv_path'] as $column) {
                $rawPath = $portfolio->home->getRawOriginal($column) ?? $portfolio->home->{$column};
                if ($rawPath && is_string($rawPath) && ! str_starts_with($rawPath, 'http')) {
                    $paths[] = $rawPath;
                }
            }
        }

        $projects = $portfolio->relationLoaded('projects')
            ? $portfolio->projects
            : $portfolio->projects()->with('images')->get();

        foreach ($projects as $project) {
            $rawCover = $project->getRawOriginal('image_path') ?? $project->image_path;
            foreach ((array) $rawCover as $path) {
                if ($path && is_string($path) && ! str_starts_with($path, 'http')) {
                    $paths[] = $path;
                }
            }

            $images = $project->relationLoaded('images') ? $project->images : $project->images()->get();
            foreach ($images as $showcase) {
                foreach ((array) $showcase->image_path as $path) {
                    if ($path && is_string($path) && ! str_starts_with($path, 'http')) {
                        $paths[] = $path;
                    }
                }
            }
        }

        return array_values(array_unique($paths));
    }

    /**
     * Delete only the portfolio SQL records (used inside an outer transaction before file cleanup).
     */
    public function deletePortfolioRecordOnly(PortfolioUser $portfolio): void
    {
        $userId = $portfolio->user_id;
        $portfolio->delete();
        $this->clearPortfolioCache($userId);
    }

    /**
     * Delete portfolio in SQL first inside a transaction, then remove files from public storage.
     */
    public function deletePortfolio(PortfolioUser $portfolio): void
    {
        $filesToDelete = $this->collectPortfolioFilePaths($portfolio);

        DB::beginTransaction();

        try {
            $this->deletePortfolioRecordOnly($portfolio);
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }

        $disk = Storage::disk('public');
        foreach ($filesToDelete as $path) {
            $disk->delete($path);
        }
    }

    /**
     * Clear portfolio cache for a specific user.
     */
    private function clearPortfolioCache(int $userId): void
    {
        Cache::forget("portfolio:user:{$userId}");
    }
}
