<?php

namespace App\Services;

use App\Models\Contact;
use App\Models\Home;
use App\Models\PortfolioSetting;
use App\Models\PortfolioUser;
use App\Models\Project;
use App\Models\TechStack;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection as SupportCollection;
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
                    'contacts',
                    'experiences',
                ])
                ->first();
        });
    }

    /**
     * Get public portfolio with resolved experience tech stacks.
     */
    public function getPublicPortfolio(int $userId = 1): ?PortfolioUser
    {
        $user = User::findOrFail($userId);
        $portfolio = $this->getPortfolio($user);

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

        return $portfolio;
    }

    /**
     * List all projects ordered deterministically.
     */
    public function listProjects(): Collection
    {
        return Project::with(['techStacks', 'images'])
            ->orderBy('sort_order', 'asc')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();
    }

    /**
     * Get single project by slug.
     */
    public function getProjectBySlug(string $slug): ?Project
    {
        return Project::with(['techStacks', 'images'])
            ->where('slug', $slug)
            ->first();
    }

    /**
     * Get the home section for the user's portfolio.
     */
    public function getHomeSection(User $user): ?Home
    {
        return $this->getPortfolio($user)?->home;
    }

    /**
     * Get the about / profile info from the home section (since `about` table was merged into `home`).
     */
    public function getAboutSection(User $user): ?Home
    {
        return $this->getPortfolio($user)?->home;
    }

    /**
     * Get skills section grouped by category name.
     */
    public function getSkillsSection(User $user): ?SupportCollection
    {
        $portfolio = $this->getPortfolio($user);

        if (! $portfolio) {
            return null;
        }

        return $portfolio->userSkills
            ->filter(fn ($skill) => $skill->techStack?->name !== null)
            ->groupBy(fn ($skill) => $skill->techStack->category?->name ?? 'database')
            ->map(fn ($skills) => $skills
                ->map(fn ($skill) => $skill->techStack->name)
                ->unique()
                ->values()
            );
    }

    /**
     * Get logo setting from settings table.
     */
    public function getLogoSetting(): ?PortfolioSetting
    {
        return PortfolioSetting::where('name', 'logo')->first();
    }

    /**
     * Initialize a default portfolio for the given user.
     */
    public function createDefaultPortfolio(User $user): PortfolioUser
    {
        return DB::transaction(function () use ($user) {
            $portfolio = $user->portfolioUser()->create([
                'sections' => ['home', 'about', 'projects', 'contact'],
                'theme' => 'default',
                'slug' => Str::slug($user->name).'-'.Str::lower(Str::random(5)),
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
                $oldFiles[] = $homeSection->{$column};
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
            if ($oldFile) {
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
     * Update project sort order and featured status.
     *
     * @return array<int>
     */
    public function updateProjectsOrder(User $user, array $projects): ?array
    {
        $portfolio = $user->portfolioUser()->first();

        if (! $portfolio) {
            return null;
        }

        $updatedIds = [];

        DB::transaction(function () use ($portfolio, $projects, &$updatedIds) {
            foreach ($projects as $projectData) {
                $existingProject = $portfolio->projects()->where('id', $projectData['id'])->first();

                if ($existingProject) {
                    $existingProject->update([
                        'sort_order' => $projectData['sort_order'] ?? 999,
                        'is_featured' => $projectData['is_featured'] ?? false,
                    ]);

                    $updatedIds[] = $existingProject->id;
                }
            }
        });

        $this->clearPortfolioCache($user->id);

        return $updatedIds;
    }

    /**
     * Create or update complete portfolio (supports both JSON and multipart form-data).
     */
    public function createOrUpdatePortfolio(User $user, array $data, array $files = []): PortfolioUser
    {
        return DB::transaction(function () use ($user, $data, $files) {
            if (isset($files['about_image']) && $files['about_image'] instanceof UploadedFile) {
                $data['home']['image_path'] = $files['about_image']->store('portfolios/images', 'public');
            }

            if (isset($files['about_cv']) && $files['about_cv'] instanceof UploadedFile) {
                $data['home']['cv_path'] = $files['about_cv']->store('portfolios/cvs', 'public');
            }

            if (isset($files['home_logo']) && $files['home_logo'] instanceof UploadedFile) {
                $data['home']['logo_path'] = $files['home_logo']->store('portfolios/logos', 'public');
            }

            if (isset($files['project_images']) && is_array($files['project_images'])) {
                foreach ($files['project_images'] as $index => $projectImage) {
                    if ($projectImage instanceof UploadedFile && isset($data['projects'][$index])) {
                        $data['projects'][$index]['image_path'] = $projectImage->store('portfolios/project_images', 'public');
                    }
                }
            }

            $portfolio = $user->portfolioUser()->first();

            if (! $portfolio) {
                $portfolio = $this->createPortfolio($user, $data);
            } else {
                $portfolio = $this->updatePortfolio($portfolio, $data);
            }

            $this->clearPortfolioCache($user->id);

            return $portfolio->load(['home', 'projects', 'contacts']);
        });
    }

    /**
     * Delete portfolio and all related files in public storage.
     */
    public function deletePortfolio(PortfolioUser $portfolio): void
    {
        DB::transaction(function () use ($portfolio) {
            $disk = Storage::disk('public');

            if ($portfolio->home) {
                foreach (['logo_path', 'image_path', 'cv_path'] as $column) {
                    if ($portfolio->home->{$column}) {
                        $disk->delete($portfolio->home->{$column});
                    }
                }
            }

            foreach ($portfolio->projects as $project) {
                if (! empty($project->image_path)) {
                    foreach ((array) $project->image_path as $path) {
                        if ($path) {
                            $disk->delete($path);
                        }
                    }
                }
            }

            $userId = $portfolio->user_id;
            $portfolio->delete();

            $this->clearPortfolioCache($userId);
        });
    }

    private function createPortfolio(User $user, array $data): PortfolioUser
    {
        $portfolio = $user->portfolioUser()->create([
            'sections' => $data['sections'] ?? ['home', 'about', 'projects', 'contact'],
            'theme' => $data['theme'] ?? 'default',
            'slug' => $data['slug'] ?? Str::slug($user->name).'-'.Str::lower(Str::random(5)),
            'is_active' => $data['is_active'] ?? true,
        ]);

        $portfolio->home()->create([
            'greeting' => $data['home']['greeting'] ?? 'Hello, I am',
            'name' => $data['home']['name'] ?? $user->name,
            'passions' => $data['home']['passions'] ?? [],
            'description' => $data['home']['description'] ?? '',
            'logo_path' => $data['home']['logo_path'] ?? null,
            'image_path' => $data['home']['image_path'] ?? $data['about']['image_path'] ?? null,
            'cv_path' => $data['home']['cv_path'] ?? $data['about']['cv_path'] ?? null,
            'social_media_links' => $data['home']['social_media_links'] ?? [],
        ]);

        $portfolio->contacts()->create([
            'email' => $data['contacts']['email'] ?? $user->email,
            'phone' => $data['contacts']['phone'] ?? null,
            'address' => $data['contacts']['address'] ?? null,
        ]);

        if (isset($data['projects']) && is_array($data['projects'])) {
            foreach ($data['projects'] as $projectData) {
                if (! empty($projectData['title'])) {
                    $portfolio->projects()->create([
                        'title' => $projectData['title'],
                        'slug' => $projectData['slug'] ?? Str::slug($projectData['title']).'-'.Str::lower(Str::random(4)),
                        'description' => $projectData['description'] ?? '',
                        'tech_stack' => $projectData['tech_stack'] ?? [],
                        'image_path' => $projectData['image_path'] ?? null,
                        'demo_url' => $projectData['demo_url'] ?? null,
                        'source_url' => $projectData['source_url'] ?? null,
                        'is_featured' => $projectData['is_featured'] ?? false,
                        'sort_order' => $projectData['sort_order'] ?? 999,
                    ]);
                }
            }
        }

        return $portfolio;
    }

    private function updatePortfolio(PortfolioUser $portfolio, array $data): PortfolioUser
    {
        $portfolio->update([
            'sections' => $data['sections'] ?? $portfolio->sections,
            'theme' => $data['theme'] ?? $portfolio->theme,
            'slug' => $data['slug'] ?? $portfolio->slug,
            'is_active' => $data['is_active'] ?? $portfolio->is_active,
        ]);

        if (isset($data['home']) && $portfolio->home) {
            $portfolio->home->update($data['home']);
        }

        if (isset($data['about']) && $portfolio->home) {
            $disk = Storage::disk('public');
            $homeUpdate = [];

            if (isset($data['about']['image_path'])) {
                if ($portfolio->home->image_path) {
                    $disk->delete($portfolio->home->image_path);
                }
                $homeUpdate['image_path'] = $data['about']['image_path'];
            }

            if (isset($data['about']['cv_path'])) {
                if ($portfolio->home->cv_path) {
                    $disk->delete($portfolio->home->cv_path);
                }
                $homeUpdate['cv_path'] = $data['about']['cv_path'];
            }

            if (! empty($homeUpdate)) {
                $portfolio->home->update($homeUpdate);
            }
        }

        if (isset($data['contacts']) && $portfolio->contacts) {
            $portfolio->contacts->update(collect($data['contacts'])->only(['email', 'phone', 'address'])->all());
        }

        if (isset($data['projects']) && is_array($data['projects'])) {
            $this->syncProjects($portfolio, $data['projects']);
        }

        return $portfolio;
    }

    private function syncProjects(PortfolioUser $portfolio, array $projects): void
    {
        $disk = Storage::disk('public');
        $projectIds = [];

        foreach ($projects as $projectData) {
            if (! empty($projectData['id'])) {
                $project = $portfolio->projects()->find($projectData['id']);

                if ($project) {
                    if (isset($projectData['image_path']) && $project->image_path) {
                        foreach ((array) $project->image_path as $oldPath) {
                            if ($oldPath) {
                                $disk->delete($oldPath);
                            }
                        }
                    }

                    $project->update([
                        'title' => $projectData['title'] ?? $project->title,
                        'description' => $projectData['description'] ?? $project->description,
                        'tech_stack' => $projectData['tech_stack'] ?? $project->tech_stack,
                        'image_path' => $projectData['image_path'] ?? $project->image_path,
                        'demo_url' => $projectData['demo_url'] ?? $project->demo_url,
                        'source_url' => $projectData['source_url'] ?? $project->source_url,
                        'is_featured' => $projectData['is_featured'] ?? $project->is_featured,
                        'sort_order' => $projectData['sort_order'] ?? $project->sort_order,
                    ]);

                    $projectIds[] = $project->id;
                }
            } elseif (! empty($projectData['title'])) {
                $newProject = $portfolio->projects()->create([
                    'title' => $projectData['title'],
                    'slug' => $projectData['slug'] ?? Str::slug($projectData['title']).'-'.Str::lower(Str::random(4)),
                    'description' => $projectData['description'] ?? '',
                    'tech_stack' => $projectData['tech_stack'] ?? [],
                    'image_path' => $projectData['image_path'] ?? null,
                    'demo_url' => $projectData['demo_url'] ?? null,
                    'source_url' => $projectData['source_url'] ?? null,
                    'is_featured' => $projectData['is_featured'] ?? false,
                    'sort_order' => $projectData['sort_order'] ?? 999,
                ]);

                $projectIds[] = $newProject->id;
            }
        }

        $deletedProjects = $portfolio->projects()->whereNotIn('id', $projectIds)->get();

        foreach ($deletedProjects as $project) {
            if (! empty($project->image_path)) {
                foreach ((array) $project->image_path as $path) {
                    if ($path) {
                        $disk->delete($path);
                    }
                }
            }

            $project->delete();
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
