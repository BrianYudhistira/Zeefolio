<?php

namespace App\Services;

use App\Models\User;
use App\Models\PortfolioUser;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;

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
                ->with(['home', 'userSkills.techStack.category', 'projects', 'contacts'])
                ->first();
        });
    }

    public function getHomeSection(User $user)
    {
        $portfolio = $this->getPortfolio($user);
        return $portfolio ? $portfolio->home : null;
    }

    public function editHomeSection(User $user, array $data)
    {
        $portfolio = $this->getPortfolio($user);
        if (!$portfolio) {
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
            ])->all());

            foreach ([
                'image' => ['column' => 'image_path', 'directory' => 'portfolios/images'],
                'cv' => ['column' => 'cv_path', 'directory' => 'portfolios/cvs'],
            ] as $input => $fileConfig) {
                if (!isset($data[$input]) || !$data[$input] instanceof UploadedFile) {
                    continue;
                }

                $column = $fileConfig['column'];
                $oldFiles[] = $homeSection->{$column};
                $newPath = $data[$input]->store($fileConfig['directory'], 'public');

                if (!$newPath) {
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

        return $homeSection;
    }

    public function getSkillsSection(User $user)
    {
        $portfolio = $this->getPortfolio($user);

        if (!$portfolio) {
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
     * Clear portfolio cache for specific user
     * Called after any portfolio modification
     */
    private function clearPortfolioCache(int $userId): void
    {
        Cache::forget("portfolio:user:{$userId}");
    }
}
