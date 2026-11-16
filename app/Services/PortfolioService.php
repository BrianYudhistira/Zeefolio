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
    public const CATALOG_VERSION_KEY = 'portfolio:catalog_version';

    /**
     * Get the current global catalog cache version.
     */
    public function getCatalogVersion(): int
    {
        return (int) Cache::rememberForever(self::CATALOG_VERSION_KEY, static fn () => 1);
    }

    /**
     * Increment the global catalog version to invalidate cached portfolios in O(1) without Cache::flush().
     */
    public function bumpCatalogVersion(): void
    {
        $next = $this->getCatalogVersion() + 1;
        Cache::forever(self::CATALOG_VERSION_KEY, $next);
    }

    /**
     * Build the versioned cache key for a user's portfolio.
     */
    protected function getUserCacheKey(int $userId): string
    {
        $version = $this->getCatalogVersion();

        return "portfolio:v{$version}:user:{$userId}";
    }

    /**
     * Get the cached portfolio slug for a user (used by HandleInertiaRequests).
     */
    public function getUserPortfolioSlug(User $user): string
    {
        return Cache::remember(
            "portfolio:slug_by_user:{$user->id}",
            3600,
            fn () => $user->portfolioUser()->value('slug') ?: ($user->username ?: 'brian-yudhistira')
        );
    }

    /**
     * Get portfolio by user model (cached for 1 hour with hydrated experience tech stacks).
     */
    public function getPortfolio(User $user): ?PortfolioUser
    {
        return $this->getPortfolioByUserId($user->id);
    }

    /**
     * Get portfolio by user ID (cached for 1 hour, 0 DB queries on cache hit).
     */
    public function getPortfolioByUserId(int $userId): ?PortfolioUser
    {
        $cacheKey = $this->getUserCacheKey($userId);

        return Cache::remember($cacheKey, 3600, function () use ($userId) {
            $portfolio = PortfolioUser::where('user_id', $userId)
                ->with([
                    'home',
                    'userSkills.techStack.category',
                    'projects' => fn ($query) => $query
                        ->where('is_active', true)
                        ->orderBy('sort_order', 'asc')
                        ->orderByDesc('created_at')
                        ->orderByDesc('id'),
                    'projects.techStacks',
                    'projects.images',
                    'contacts',
                    'experiences',
                ])
                ->first();

            return $this->hydrateExperienceTechStacks($portfolio);
        });
    }

    /**
     * Get public portfolio with resolved experience tech stacks by user ID.
     */
    public function getPublicPortfolio(int $userId = 1): ?PortfolioUser
    {
        return $this->getPortfolioByUserId($userId);
    }

    /**
     * Get public portfolio by portfolio slug (or fallback to user username).
     */
    public function getPublicPortfolioBySlug(string $slug): ?PortfolioUser
    {
        $slugCacheKey = 'portfolio:user_id_by_slug:' . Str::lower($slug);

        $userId = Cache::remember($slugCacheKey, 3600, function () use ($slug) {
            $portfolioUserId = PortfolioUser::where('slug', $slug)->value('user_id');
            if ($portfolioUserId) {
                return (int) $portfolioUserId;
            }

            $user = User::where('username', $slug)->first();
            if (! $user) {
                return null;
            }

            $existingPortfolio = $user->portfolioUser()->first();
            if ($existingPortfolio) {
                return (int) $existingPortfolio->user_id;
            }

            return null;
        });

        if (! $userId) {
            return null;
        }

        return $this->getPublicPortfolio((int) $userId);
    }

    /**
     * Resolve experience tech stack icons and selected skill categories on a portfolio instance.
     */
    protected function hydrateExperienceTechStacks(?PortfolioUser $portfolio): ?PortfolioUser
    {
        if (! $portfolio) {
            return null;
        }

        if ($portfolio->experiences && $portfolio->experiences->isNotEmpty()) {
            $neededNames = $portfolio->experiences
                ->flatMap(fn ($exp) => array_filter(array_map('trim', explode(',', $exp->tech_stack ?? ''))))
                ->map(fn (string $name) => Str::lower($name))
                ->unique()
                ->values()
                ->all();

            $allTechStacks = ! empty($neededNames)
                ? TechStack::query()
                    ->where(function ($query) use ($portfolio) {
                        $query->where('is_global', true)
                            ->orWhere('user_id', $portfolio->user_id);
                    })
                    ->get(['id', 'name', 'icon'])
                    ->keyBy(fn (TechStack $item) => Str::lower(trim($item->name)))
                : collect();

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

        $rawCategories = $portfolio->skill_categories;

        if (is_string($rawCategories)) {
            $rawCategories = json_decode($rawCategories, true);
        }

        $savedCategoryIds = is_array($rawCategories)
            ? array_values(array_filter(array_map('intval', $rawCategories)))
            : [];

        $portfolio->skill_categories = $savedCategoryIds;

        if (! empty($savedCategoryIds)) {
            $categoriesById = TechStackCategory::whereIn('id', $savedCategoryIds)
                ->get(['id', 'name'])
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

        return $portfolio;
    }

    /**
     * List projects ordered deterministically (scoped to a portfolio when provided).
     */
    public function listProjects(?PortfolioUser $portfolio = null, bool $onlyActive = true): Collection
    {
        $query = $portfolio
            ? $portfolio->projects()
            : Project::query();

        return $query
            ->when($onlyActive, fn ($q) => $q->where('is_active', true))
            ->with(['techStacks', 'images'])
            ->orderBy('sort_order', 'asc')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();
    }

    /**
     * Get single project by slug (scoped to a portfolio when provided).
     */
    public function getProjectBySlug(string $slug, ?PortfolioUser $portfolio = null, bool $onlyActive = true): ?Project
    {
        $query = $portfolio
            ? $portfolio->projects()
            : Project::query();

        return $query
            ->when($onlyActive, fn ($q) => $q->where('is_active', true))
            ->with(['techStacks', 'images', 'portfolioUser'])
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
            $isReserved = in_array(Str::lower($baseSlug), array_map('strtolower', PortfolioUser::RESERVED_SLUGS), true);
            $slug = ($isReserved || PortfolioUser::where('slug', $baseSlug)->exists())
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

        $contact = $portfolio->contacts()->updateOrCreate(
            ['portfolio_user_id' => $portfolio->id],
            collect($data)->only(['email', 'phone', 'address'])->all()
        );

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
            $coverPath = $project->image_path;
            if ($coverPath && is_string($coverPath) && ! str_starts_with($coverPath, 'http')) {
                $paths[] = $coverPath;
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
        $slug = $portfolio->slug;
        $portfolio->delete();
        $this->forgetSlugCache($slug);
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
     * Forget cached slug-to-user mapping.
     */
    public function forgetSlugCache(?string $slug): void
    {
        if ($slug) {
            Cache::forget('portfolio:user_id_by_slug:' . Str::lower($slug));
        }
    }

    /**
     * Public helper to clear portfolio cache for a specific user ID.
     */
    public function forgetUserPortfolioCache(int $userId): void
    {
        $this->clearPortfolioCache($userId);
    }

    /**
     * Clear portfolio cache for a specific user.
     */
    private function clearPortfolioCache(int $userId): void
    {
        Cache::forget($this->getUserCacheKey($userId));
        Cache::forget("portfolio:slug_by_user:{$userId}");
    }
}
