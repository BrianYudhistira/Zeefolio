<?php

namespace App\Services;

use App\Models\User;
use App\Models\PortfolioUser;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class PortfolioService
{
    /**
     * Get portfolio by user ID
     * Cached for 1 hour to reduce DB queries
     */
    public function getPortfolio(User $user): ?PortfolioUser
    {
        $cacheKey = "portfolio:user:{$user->id}";
        
        return Cache::remember($cacheKey, 3600, function () use ($user) {
            return $user->portfolioUser()
                ->with(['home', 'about', 'projects', 'contacts'])
                ->first();
        });
    }

    public function getHomeSection(User $user)
    {
        $portfolio = $this->getPortfolio($user);
        return $portfolio ? $portfolio->home : null;
    }

    public function getAboutSection(User $user)
    {
        $portfolio = $this->getPortfolio($user);
        return $portfolio ? $portfolio->about : null;
    }

    /**
     * Create or update portfolio
     */
    public function createOrUpdatePortfolio(User $user, array $data, array $files = []): PortfolioUser
    {
        DB::beginTransaction();

        try {
            // Handle file uploads
            if (isset($files['about_image'])) {
                $imagePath = $this->storeFile($files['about_image'], 'portfolios/images');
                $data['about']['image_path'] = $imagePath;
            }

            if (isset($files['about_cv'])) {
                $cvPath = $this->storeFile($files['about_cv'], 'portfolios/cvs');
                $data['about']['cv_path'] = $cvPath;
            }

            if (isset($files['home_logo'])) {
                $logoPath = $this->storeFile($files['home_logo'], 'portfolios/logos');
                $data['home']['logo_path'] = $logoPath;
            } 

            if(isset($files['project_images']) && is_array($files['project_images'])) {
                foreach ($files['project_images'] as $index => $projectImage) {
                    $imagePath = $this->storeFile($projectImage, 'portfolios/project_images');
                    // Assuming projects are in the same order as images
                    if (isset($data['projects'][$index])) {
                        $data['projects'][$index]['image_path'] = $imagePath;
                    }
                }
            }

            $portfolio = $user->portfolioUser()->first();

            if (!$portfolio) {
                // Create new portfolio
                $portfolio = $this->createPortfolio($user, $data);
            } else {
                // Update existing portfolio
                $portfolio = $this->updatePortfolio($portfolio, $data);
            }

            DB::commit();

            // Invalidate cache after successful update
            $this->clearPortfolioCache($user->id);

            return $portfolio->load(['home', 'about', 'projects', 'contacts']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Create new portfolio
     */
    private function createPortfolio(User $user, array $data): PortfolioUser
    {
        $portfolio = $user->portfolioUser()->create([
            'sections' => $data['sections'] ?? ['home', 'about', 'projects', 'contact'],
            'theme' => $data['theme'] ?? 'default',
            'slug' => $data['slug'] ?? Str::slug($user->name) . '-' . Str::random(5),
            'is_active' => $data['is_active'] ?? true,
        ]);

        // Create home section
        $portfolio->home()->create([
            'greeting' => $data['home']['greeting'] ?? 'Hello, I am',
            'name' => $data['home']['name'] ?? $user->name,
            'passions' => $data['home']['passions'] ?? [],
            'description' => $data['home']['description'] ?? null,
            'logo_path' => $data['home']['logo_path'] ?? null,
            'social_media_links' => $data['home']['social_media_links'] ?? [],
        ]);

        // Create about section
        $portfolio->about()->create([
            'description' => $data['about']['description'] ?? null,
            'image_path' => $data['about']['image_path'] ?? null,
            'skills' => $data['about']['skills'] ?? [],
            'cv_path' => $data['about']['cv_path'] ?? null,
        ]);

        // Create contacts section
        $portfolio->contacts()->create([
            'email' => $data['contacts']['email'] ?? $user->email,
            'phone' => $data['contacts']['phone'] ?? null,
            'address' => $data['contacts']['address'] ?? null,
        ]);

        // Create projects if provided
        if (isset($data['projects']) && is_array($data['projects'])) {
            foreach ($data['projects'] as $projectData) {
                if (!empty($projectData['title'])) {
                    $portfolio->projects()->create([
                        'title' => $projectData['title'],
                        'description' => $projectData['description'] ?? null,
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

    /**
     * Update existing portfolio
     */
    private function updatePortfolio(PortfolioUser $portfolio, array $data): PortfolioUser
    {
        // Update portfolio main data
        $portfolio->update([
            'sections' => $data['sections'] ?? $portfolio->sections,
            'theme' => $data['theme'] ?? $portfolio->theme,
            'slug' => $data['slug'] ?? $portfolio->slug,
            'is_active' => $data['is_active'] ?? $portfolio->is_active,
        ]);

        // Update home section
        if (isset($data['home']) && $portfolio->home) {
            $portfolio->home->update($data['home']);
        }

        // Update about section
        if (isset($data['about']) && $portfolio->about) {
            // Delete old files if new ones provided
            if (isset($data['about']['image_path']) && $portfolio->about->image_path) {
                Storage::disk('public')->delete($portfolio->about->image_path);
            }
            if (isset($data['about']['cv_path']) && $portfolio->about->cv_path) {
                Storage::disk('public')->delete($portfolio->about->cv_path);
            }

            $portfolio->about->update($data['about']);
        }

        // Update contacts section
        if (isset($data['contacts']) && $portfolio->contacts) {
            $portfolio->contacts->update($data['contacts']);
        }

        // Update projects
        if (isset($data['projects'])) {
            $this->updateProjects($portfolio, $data['projects']);
        }

        return $portfolio;
    }

    /**
     * Update projects (create, update, delete)
     */
    private function updateProjects(PortfolioUser $portfolio, array $projects): void
    {
        $projectIds = [];

        foreach ($projects as $projectData) {
            if (isset($projectData['id']) && $projectData['id']) {
                // Update existing project
                $project = $portfolio->projects()->find($projectData['id']);
                if ($project) {
                    // Delete old image if new one provided
                    if (isset($projectData['image_path']) && $project->image_path) {
                        Storage::disk('public')->delete($project->image_path);
                    }

                    $project->update([
                        'title' => $projectData['title'] ?? null,
                        'description' => $projectData['description'] ?? null,
                        'tech_stack' => $projectData['tech_stack'] ?? [],
                        'image_path' => $projectData['image_path'] ?? null,
                        'demo_url' => $projectData['demo_url'] ?? null,
                        'source_url' => $projectData['source_url'] ?? null,
                        'is_featured' => $projectData['is_featured'] ?? false,
                        'sort_order' => $projectData['sort_order'] ?? 999,
                    ]);
                    $projectIds[] = $project->id;
                }
            } else {
                // Create new project
                if (!empty($projectData['title'])) {
                    $newProject = $portfolio->projects()->create([
                        'title' => $projectData['title'],
                        'description' => $projectData['description'] ?? null,
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
        }

        // Delete projects not in the list
        $deletedProjects = $portfolio->projects()->whereNotIn('id', $projectIds)->get();
        foreach ($deletedProjects as $project) {
            if ($project->image_path) {
                Storage::disk('public')->delete($project->image_path);
            }
            $project->delete();
        }
    }

    /**
     * Delete portfolio and all related files
     */
    public function deletePortfolio(PortfolioUser $portfolio): void
    {
        DB::beginTransaction();

        try {
            // Delete home logo
            if ($portfolio->home && $portfolio->home->logo_path) {
                Storage::disk('public')->delete($portfolio->home->logo_path);
            }

            // Delete about images and CV
            if ($portfolio->about) {
                if ($portfolio->about->image_path) {
                    Storage::disk('public')->delete($portfolio->about->image_path);
                }
                if ($portfolio->about->cv_path) {
                    Storage::disk('public')->delete($portfolio->about->cv_path);
                }
            }

            // Delete project images
            foreach ($portfolio->projects as $project) {
                if ($project->image_path) {
                    Storage::disk('public')->delete($project->image_path);
                }
            }

            // Delete portfolio (cascade will delete relations)
            $portfolio->delete();

            // Invalidate cache
            $this->clearPortfolioCache($portfolio->user_id);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Store uploaded file directly to public folder
     * Returns path relative to public folder
     */
    private function storeFile($file, string $path): string
    {
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        
        // Create directory if not exists
        $fullPath = public_path($path);
        if (!file_exists($fullPath)) {
            mkdir($fullPath, 0755, true);
        }
        
        // Move file to public folder
        $file->move($fullPath, $filename);
        
        // Return path relative to public (for asset() helper)
        return $path . '/' . $filename;
    }

    /**
     * Clear portfolio cache for specific user
     * Called after any portfolio modification
     */
    private function clearPortfolioCache(int $userId): void
    {
        Cache::forget("portfolio:user:{$userId}");
    }
}
