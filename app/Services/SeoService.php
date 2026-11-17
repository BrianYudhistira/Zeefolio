<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\PortfolioUser;
use App\Models\Project;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class SeoService
{
    public const MIN_DESCRIPTION_LENGTH = 50;
    public const META_DESCRIPTION_LIMIT = 155;
    public const DEFAULT_PLACEHOLDER_BIO = 'A brief description about yourself.';
    public const DEFAULT_OG_IMAGE = '/images/web_icon.png';
    public const SITEMAP_CACHE_KEY = 'seo:sitemap_xml';

    /**
     * Determine whether a portfolio meets quality and visibility rules for search indexing.
     */
    public function isPortfolioIndexable(PortfolioUser $portfolio, bool $isPreviewingDraft = false): bool
    {
        if ($isPreviewingDraft || ! $portfolio->is_active) {
            return false;
        }

        if ($portfolio->relationLoaded('user') && $portfolio->user?->status === 'banned') {
            return false;
        }

        $bio = $this->cleanText($portfolio->home?->description);

        if ($bio === '' || Str::lower($bio) === Str::lower(self::DEFAULT_PLACEHOLDER_BIO)) {
            return false;
        }

        return mb_strlen($bio) >= self::MIN_DESCRIPTION_LENGTH;
    }

    /**
     * Build full SEO, OpenGraph, Twitter Card, and JSON-LD payload for the main portfolio page.
     *
     * @return array<string, mixed>
     */
    public function forPortfolio(PortfolioUser $portfolio, bool $isPreviewingDraft = false): array
    {
        $siteName = (string) config('app.name', 'ZeeFolio');
        $ownerName = $this->cleanText($portfolio->home?->name) ?: 'Developer Portfolio';

        $passions = is_array($portfolio->home?->passions) ? $portfolio->home->passions : [];
        $primaryRole = $this->cleanText(is_string($passions[0] ?? null) ? $passions[0] : null) ?: 'Software Developer';

        $title = "{$ownerName} — {$primaryRole} | {$siteName}";
        $rawBio = $this->cleanText($portfolio->home?->description);
        $description = ($rawBio !== '' && Str::lower($rawBio) !== Str::lower(self::DEFAULT_PLACEHOLDER_BIO))
            ? $this->truncate($rawBio)
            : "{$ownerName} — {$primaryRole}. Explore featured projects, technical skills, and career experience on {$siteName}.";

        $canonical = route('portfolio.index', ['slug' => $portfolio->slug]);
        $image = $this->resolvePortfolioImage($portfolio);
        $indexable = $this->isPortfolioIndexable($portfolio, $isPreviewingDraft);

        $robots = $indexable
            ? 'index, follow, max-image-preview:large, max-snippet:-1'
            : 'noindex, nofollow';

        return [
            'title' => $title,
            'description' => $description,
            'canonical' => $canonical,
            'robots' => $robots,
            'og' => [
                'type' => 'profile',
                'site_name' => $siteName,
                'title' => $title,
                'description' => $description,
                'url' => $canonical,
                'image' => $image,
            ],
            'twitter' => [
                'card' => 'summary_large_image',
                'title' => $title,
                'description' => $description,
                'image' => $image,
            ],
            'json_ld' => $this->buildProfileJsonLd($portfolio, $ownerName, $primaryRole, $description, $canonical, $image),
        ];
    }

    /**
     * Build OpenGraph & Twitter Card metadata for the projects archive page (no sitemap/JSON-LD).
     *
     * @return array<string, mixed>
     */
    public function forProjectsArchive(PortfolioUser $portfolio, int $projectCount = 0): array
    {
        $siteName = (string) config('app.name', 'ZeeFolio');
        $ownerName = $this->cleanText($portfolio->home?->name) ?: 'Developer';

        $title = "Projects — {$ownerName} | {$siteName}";
        $description = $projectCount > 0
            ? "Browse {$projectCount} software projects and engineering works built by {$ownerName}."
            : "Browse software projects and engineering works built by {$ownerName}.";

        $canonical = route('portfolio.projects', ['slug' => $portfolio->slug]);
        $image = $this->resolvePortfolioImage($portfolio);

        return [
            'title' => $title,
            'description' => $this->truncate($description),
            'canonical' => $canonical,
            'robots' => 'noindex, follow',
            'og' => [
                'type' => 'website',
                'site_name' => $siteName,
                'title' => $title,
                'description' => $this->truncate($description),
                'url' => $canonical,
                'image' => $image,
            ],
            'twitter' => [
                'card' => 'summary_large_image',
                'title' => $title,
                'description' => $this->truncate($description),
                'image' => $image,
            ],
            'json_ld' => null,
        ];
    }

    /**
     * Build OpenGraph & Twitter Card metadata for a project detail page (no sitemap/JSON-LD).
     *
     * @return array<string, mixed>
     */
    public function forProjectDetail(PortfolioUser $portfolio, Project $project): array
    {
        $siteName = (string) config('app.name', 'ZeeFolio');
        $ownerName = $this->cleanText($portfolio->home?->name) ?: 'Developer';
        $projectTitle = $this->cleanText($project->title) ?: 'Project';

        $title = "{$projectTitle} — {$ownerName} | {$siteName}";
        $rawDescription = $this->cleanText($project->description);
        $description = $rawDescription !== ''
            ? $this->truncate($rawDescription)
            : "{$projectTitle} by {$ownerName}. Explore project overview, tech stack, and screenshots on {$siteName}.";

        $canonical = route('portfolio.project', [
            'slug' => $portfolio->slug,
            'projectSlug' => $project->slug,
        ]);
        $image = $this->resolveProjectImage($portfolio, $project);

        return [
            'title' => $title,
            'description' => $description,
            'canonical' => $canonical,
            'robots' => 'noindex, follow',
            'og' => [
                'type' => 'article',
                'site_name' => $siteName,
                'title' => $title,
                'description' => $description,
                'url' => $canonical,
                'image' => $image,
            ],
            'twitter' => [
                'card' => 'summary_large_image',
                'title' => $title,
                'description' => $description,
                'image' => $image,
            ],
            'json_ld' => null,
        ];
    }

    /**
     * Generate and cache XML sitemap containing only indexable public main portfolio pages.
     */
    public function generateSitemapXml(): string
    {
        return Cache::remember(self::SITEMAP_CACHE_KEY, 3600, function (): string {
            $lines = [
                '<?xml version="1.0" encoding="UTF-8"?>',
                '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            ];

            PortfolioUser::query()
                ->where('is_active', true)
                ->whereHas('user', fn ($q) => $q->where('status', '!=', 'banned')->orWhereNull('status'))
                ->whereHas('home', function ($q): void {
                    $q->whereNotNull('description')
                        ->where('description', '!=', self::DEFAULT_PLACEHOLDER_BIO);
                })
                ->with([
                    'home:id,portfolio_user_id,description,updated_at',
                    'user:id,status',
                ])
                ->select(['id', 'user_id', 'slug', 'is_active', 'updated_at'])
                ->chunkById(200, function ($portfolios) use (&$lines): void {
                    foreach ($portfolios as $portfolio) {
                        if (! $this->isPortfolioIndexable($portfolio)) {
                            continue;
                        }

                        $loc = e(route('portfolio.index', ['slug' => $portfolio->slug]));
                        $lastModDate = $portfolio->home?->updated_at ?? $portfolio->updated_at ?? now();
                        $lastmod = $lastModDate->toAtomString();

                        $lines[] = '  <url>';
                        $lines[] = "    <loc>{$loc}</loc>";
                        $lines[] = "    <lastmod>{$lastmod}</lastmod>";
                        $lines[] = '    <changefreq>weekly</changefreq>';
                        $lines[] = '    <priority>0.8</priority>';
                        $lines[] = '  </url>';
                    }
                });

            $lines[] = '</urlset>';

            return implode("\n", $lines);
        });
    }

    /**
     * Clear cached XML sitemap so updated portfolios appear/disappear immediately.
     */
    public function invalidateSitemapCache(): void
    {
        Cache::forget(self::SITEMAP_CACHE_KEY);
    }

    /**
     * Build Schema.org ProfilePage + Person JSON-LD structured data.
     *
     * @return array<string, mixed>
     */
    protected function buildProfileJsonLd(
        PortfolioUser $portfolio,
        string $ownerName,
        string $primaryRole,
        string $description,
        string $canonical,
        string $image
    ): array {
        $sameAs = collect((array) ($portfolio->home?->social_media_links ?? []))
            ->filter(fn ($url) => is_string($url) && preg_match('/^https?:\/\//i', trim($url)) === 1)
            ->map(fn (string $url) => trim($url))
            ->unique()
            ->values()
            ->all();

        $knowsAbout = $portfolio->relationLoaded('userSkills')
            ? $portfolio->userSkills
                ->map(fn ($skill) => $skill->techStack?->name)
                ->filter(fn ($name) => is_string($name) && trim($name) !== '')
                ->unique()
                ->values()
                ->all()
            : [];

        $person = array_filter([
            '@type' => 'Person',
            'name' => $ownerName,
            'jobTitle' => $primaryRole,
            'description' => $description,
            'image' => $image,
            'url' => $canonical,
            'sameAs' => $sameAs,
            'knowsAbout' => $knowsAbout,
        ], static fn ($value) => $value !== [] && $value !== null && $value !== '');

        $dateModified = ($portfolio->home?->updated_at ?? $portfolio->updated_at)?->toAtomString();

        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'ProfilePage',
            'url' => $canonical,
            'dateModified' => $dateModified,
            'mainEntity' => $person,
        ], static fn ($value) => $value !== null && $value !== '');
    }

    protected function resolvePortfolioImage(PortfolioUser $portfolio): string
    {
        $candidate = $portfolio->home?->image_url
            ?: ($portfolio->user?->photo_url ?: asset(self::DEFAULT_OG_IMAGE));

        return $this->absoluteUrl($candidate);
    }

    protected function resolveProjectImage(PortfolioUser $portfolio, Project $project): string
    {
        if (is_string($project->image_url) && trim($project->image_url) !== '') {
            return $this->absoluteUrl($project->image_url);
        }

        if ($project->relationLoaded('images') || $project->images) {
            foreach ($project->images as $showcase) {
                $urls = is_array($showcase->image_url)
                    ? $showcase->image_url
                    : (is_string($showcase->image_url) ? [$showcase->image_url] : []);

                foreach ($urls as $url) {
                    if (is_string($url) && trim($url) !== '') {
                        return $this->absoluteUrl($url);
                    }
                }

                $paths = is_array($showcase->image_path)
                    ? $showcase->image_path
                    : (is_string($showcase->image_path) ? [$showcase->image_path] : []);

                foreach ($paths as $path) {
                    if (is_string($path) && trim($path) !== '') {
                        return $this->absoluteUrl(asset('storage/' . ltrim($path, '/')));
                    }
                }
            }
        }

        return $this->resolvePortfolioImage($portfolio);
    }

    protected function absoluteUrl(?string $path): string
    {
        $trimmed = trim((string) $path);
        if ($trimmed === '') {
            return asset(self::DEFAULT_OG_IMAGE);
        }

        if (str_starts_with($trimmed, 'http://') || str_starts_with($trimmed, 'https://')) {
            return $trimmed;
        }

        return url($trimmed);
    }

    protected function cleanText(?string $value): string
    {
        $stripped = strip_tags((string) $value);

        return trim((string) preg_replace('/\s+/', ' ', $stripped));
    }

    protected function truncate(?string $value, int $limit = self::META_DESCRIPTION_LIMIT): string
    {
        return Str::limit($this->cleanText($value), $limit);
    }
}
