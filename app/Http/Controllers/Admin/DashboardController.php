<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Log;
use App\Models\PortfolioView;
use App\Services\PortfolioService;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const VIEW_RANGES = ['1h', '5h', '24h', '1w', '1m', '3m', '6m', '1y'];

    public function __construct(
        protected PortfolioService $portfolioService,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $portfolio = $this->portfolioService->getPortfolio($user);

        $projects = $portfolio?->projects ?? collect();
        $skills = $portfolio?->userSkills ?? collect();
        $experiences = $portfolio?->experiences ?? collect();

        $range = $request->query('range', '24h');
        if (! in_array($range, self::VIEW_RANGES, true)) {
            $range = '24h';
        }

        $viewAnalytics = $this->buildViewAnalytics($portfolio?->id, $range);

        $recentLogs = Log::query()
            ->where('user_id', $user->id)
            ->latest()
            ->limit(6)
            ->get(['id', 'type', 'module', 'message', 'ip_address', 'location', 'created_at']);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'projects' => $projects->count(),
                'featuredProjects' => $projects->where('is_featured', true)->count(),
                'skills' => $skills->count(),
                'experiences' => $experiences->count(),
                'logs' => Log::query()->where('user_id', $user->id)->count(),
                'views' => $viewAnalytics['totalViews'],
            ],
            'viewAnalytics' => $viewAnalytics,
            'portfolioSummary' => [
                'is_active' => (bool) ($portfolio?->is_active ?? false),
                'slug' => $portfolio?->slug,
                'theme' => $portfolio?->theme ?? 'default',
                'home_name' => $portfolio?->home?->name,
                'contact_email' => $portfolio?->contacts?->email,
            ],
            'recentProjects' => $projects->sortBy('sort_order')->take(5)->values()->map(fn ($project) => [
                'id' => $project->id,
                'title' => $project->title,
                'slug' => $project->slug,
                'project_type' => $project->project_type,
                'is_featured' => (bool) $project->is_featured,
                'tech_stacks' => $project->techStacks->pluck('name')->values(),
            ]),
            'recentLogs' => $recentLogs,
        ]);
    }

    /**
     * Build time-series portfolio view analytics for the requested range (max 1 year).
     */
    private function buildViewAnalytics(?int $portfolioUserId, string $range): array
    {
        $now = CarbonImmutable::now();
        $buckets = $this->createBuckets($now, $range);
        $startAt = $buckets[0]['start'];

        if (! $portfolioUserId) {
            return [
                'range' => $range,
                'totalViews' => 0,
                'rangeViews' => 0,
                'uniqueVisitors' => 0,
                'peakViews' => 0,
                'series' => array_map(fn ($b) => [
                    'label' => $b['label'],
                    'fullLabel' => $b['fullLabel'],
                    'views' => 0,
                ], $buckets),
            ];
        }

        $totalViews = PortfolioView::query()
            ->where('portfolio_user_id', $portfolioUserId)
            ->count();

        $summary = PortfolioView::query()
            ->where('portfolio_user_id', $portfolioUserId)
            ->where('viewed_at', '>=', $startAt)
            ->toBase()
            ->selectRaw('COUNT(*) as range_views, COUNT(DISTINCT ip_hash) as unique_visitors')
            ->first();

        $rangeViews = (int) ($summary->range_views ?? 0);
        $uniqueVisitors = (int) ($summary->unique_visitors ?? 0);

        $counts = array_fill(0, count($buckets), 0);

        if ($rangeViews > 0) {
            $rawTimestamps = PortfolioView::query()
                ->where('portfolio_user_id', $portfolioUserId)
                ->where('viewed_at', '>=', $startAt)
                ->toBase()
                ->pluck('viewed_at');

            foreach ($rawTimestamps as $rawViewedAt) {
                $timestamp = is_numeric($rawViewedAt)
                    ? (int) $rawViewedAt
                    : strtotime((string) $rawViewedAt);

                if ($timestamp === false) {
                    continue;
                }

                foreach ($buckets as $index => $bucket) {
                    if ($timestamp >= $bucket['startTs'] && $timestamp < $bucket['endTs']) {
                        $counts[$index]++;
                        break;
                    }
                }
            }
        }

        $series = [];
        $peakViews = 0;
        foreach ($buckets as $index => $bucket) {
            $count = $counts[$index];
            if ($count > $peakViews) {
                $peakViews = $count;
            }

            $series[] = [
                'label' => $bucket['label'],
                'fullLabel' => $bucket['fullLabel'],
                'views' => $count,
            ];
        }

        return [
            'range' => $range,
            'totalViews' => $totalViews,
            'rangeViews' => $rangeViews,
            'uniqueVisitors' => $uniqueVisitors,
            'peakViews' => $peakViews,
            'series' => $series,
        ];
    }

    /**
     * Generate contiguous time buckets for the selected range.
     *
     * @return array<int, array<string, mixed>>
     */
    private function createBuckets(CarbonImmutable $now, string $range): array
    {
        $config = match ($range) {
            '1h' => ['count' => 12, 'unit' => 'minute', 'step' => 5],
            '5h' => ['count' => 15, 'unit' => 'minute', 'step' => 20],
            '24h' => ['count' => 24, 'unit' => 'hour', 'step' => 1],
            '1w' => ['count' => 7, 'unit' => 'day', 'step' => 1],
            '1m' => ['count' => 30, 'unit' => 'day', 'step' => 1],
            '3m' => ['count' => 13, 'unit' => 'week', 'step' => 1],
            '6m' => ['count' => 26, 'unit' => 'week', 'step' => 1],
            '1y' => ['count' => 12, 'unit' => 'month', 'step' => 1],
        };

        $anchor = match ($config['unit']) {
            'minute' => $now->setSecond(0)->setMinute(
                (int) (floor($now->minute / $config['step']) * $config['step'])
            ),
            'hour' => $now->startOfHour(),
            'day' => $now->startOfDay(),
            'week' => $now->startOfWeek(),
            'month' => $now->startOfMonth(),
        };

        $buckets = [];
        $count = $config['count'];
        $step = $config['step'];

        for ($i = $count - 1; $i >= 0; $i--) {
            $offset = $i * $step;
            $start = match ($config['unit']) {
                'minute' => $anchor->subMinutes($offset),
                'hour' => $anchor->subHours($offset),
                'day' => $anchor->subDays($offset),
                'week' => $anchor->subWeeks($offset),
                'month' => $anchor->subMonths($offset),
            };

            $end = match ($config['unit']) {
                'minute' => $start->addMinutes($step),
                'hour' => $start->addHours($step),
                'day' => $start->addDays($step),
                'week' => $start->addWeeks($step),
                'month' => $start->addMonths($step),
            };

            $label = match ($config['unit']) {
                'minute', 'hour' => $start->format('H:i'),
                'day', 'week' => $start->format('M d'),
                'month' => $start->format('M y'),
            };

            $fullLabel = match ($config['unit']) {
                'minute', 'hour' => $start->format('M d, H:i') . ' - ' . $end->format('H:i'),
                'day' => $start->format('D, M d, Y'),
                'week' => 'Week of ' . $start->format('M d, Y'),
                'month' => $start->format('F Y'),
            };

            $buckets[] = [
                'start' => $start,
                'startTs' => $start->getTimestamp(),
                'endTs' => $end->getTimestamp(),
                'label' => $label,
                'fullLabel' => $fullLabel,
            ];
        }

        return $buckets;
    }
}
