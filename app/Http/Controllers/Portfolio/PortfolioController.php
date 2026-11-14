<?php

namespace App\Http\Controllers\Portfolio;

use App\Http\Controllers\Controller;
use App\Mail\SendMailToMe;
use App\Models\PortfolioUser;
use App\Models\PortfolioView;
use App\Services\LogService;
use App\Services\PortfolioService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    public function __construct(
        protected PortfolioService $portfolioService,
    ) {}

    public function index(Request $request, string $slug): Response
    {
        $portfolio = $this->resolveVisiblePortfolio($request, $slug);

        $this->recordView($request, $portfolio->id, 'home');

        return Inertia::render('Portfolio/Portfolio', [
            'portfolio' => $portfolio,
            'portfolioSlug' => $portfolio->slug,
            'selectedSkillCategories' => $portfolio->selected_skill_categories ?? [],
        ]);
    }

    public function listProject(Request $request, string $slug): Response
    {
        $portfolio = $this->resolveVisiblePortfolio($request, $slug);
        $projects = $this->portfolioService->listProjects($portfolio, onlyActive: true);

        $this->recordView($request, $portfolio->id, 'projects');

        return Inertia::render('Portfolio/Projects/ListProject', [
            'projects' => $projects,
            'portfolioSlug' => $portfolio->slug,
            'portfolioName' => $portfolio->home?->name ?? 'Portfolio',
        ]);
    }

    public function getProjectBySlug(Request $request, string $slug, string $projectSlug): Response
    {
        $portfolio = $this->resolveVisiblePortfolio($request, $slug);
        $project = $this->portfolioService->getProjectBySlug($projectSlug, $portfolio, onlyActive: true);

        if (! $project) {
            abort(404, 'Project not found');
        }

        $this->recordView($request, $portfolio->id, 'project', $project->id);

        return Inertia::render('Portfolio/Projects/DetailProject', [
            'project' => $project,
            'portfolioSlug' => $portfolio->slug,
            'portfolioName' => $portfolio->home?->name ?? 'Portfolio',
        ]);
    }

    public function redirectLegacyProjects(): RedirectResponse
    {
        $defaultSlug = PortfolioUser::orderBy('id')->value('slug') ?? 'brian-yudhistira';

        return redirect()->route('portfolio.projects', ['slug' => $defaultSlug]);
    }

    public function redirectLegacyProjectDetail(string $projectSlug): RedirectResponse
    {
        $project = $this->portfolioService->getProjectBySlug($projectSlug);

        if (! $project) {
            abort(404, 'Project not found');
        }

        $portfolioSlug = $project->portfolioUser?->slug
            ?? PortfolioUser::orderBy('id')->value('slug')
            ?? 'brian-yudhistira';

        return redirect()->route('portfolio.project', [
            'slug' => $portfolioSlug,
            'projectSlug' => $project->slug,
        ]);
    }

    protected function resolveVisiblePortfolio(Request $request, string $slug): PortfolioUser
    {
        $portfolio = $this->portfolioService->getPublicPortfolioBySlug($slug);

        if (! $portfolio) {
            abort(404, 'Portfolio not found.');
        }

        $viewer = $request->user();
        $canBypassDraft = $viewer && ($viewer->id === $portfolio->user_id || $viewer->isAdminOrAbove());

        if (! $portfolio->is_active && ! $canBypassDraft) {
            abort(404, 'This portfolio is currently private.');
        }

        return $portfolio;
    }

    protected function recordView(Request $request, int $portfolioUserId, string $page, ?int $projectId = null): void
    {
        // PERF-03: Skip background link prefetch requests triggered by Vite/Inertia
        if (
            str_contains(strtolower((string) $request->header('Purpose')), 'prefetch') ||
            str_contains(strtolower((string) $request->header('Sec-Purpose')), 'prefetch') ||
            str_contains(strtolower((string) $request->header('X-Purpose')), 'prefetch') ||
            strtolower((string) $request->header('X-Moz')) === 'prefetch'
        ) {
            return;
        }

        try {
            $ip = $request->ip() ?? 'unknown';
            $ipHash = hash('sha256', $ip . '|' . config('app.key'));
            $dedupeKey = "portfolio_view_dedupe:{$portfolioUserId}:{$page}:" . ($projectId ?? 0) . ":{$ipHash}";

            if (! Cache::add($dedupeKey, 1, now()->addMinutes(10))) {
                return;
            }

            $userAgent = substr((string) $request->userAgent(), 0, 255);

            PortfolioView::create([
                'portfolio_user_id' => $portfolioUserId,
                'page' => $page,
                'project_id' => $projectId,
                'ip_hash' => $ipHash,
                'user_agent' => $userAgent ?: null,
                'viewed_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Failed to record portfolio view: ' . $e->getMessage());
        }
    }

    public function sendMessage(Request $request, ?string $slug = null): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
            'portfolio_slug' => ['nullable', 'string', 'max:100'],
        ]);

        $targetSlug = $slug ?? ($validated['portfolio_slug'] ?? null);
        $recipientEmail = config('mail.to.address');

        if ($targetSlug) {
            $portfolio = $this->portfolioService->getPublicPortfolioBySlug($targetSlug);
            $recipientEmail = $portfolio?->contacts?->email
                ?: ($portfolio?->user?->email ?: $recipientEmail);
        }

        try {
            Mail::to($recipientEmail)->send(
                new SendMailToMe($validated['name'], $validated['email'], $validated['message'])
            );

            Log::info('[Portfolio] Contact message sent', [
                'portfolio_slug' => $targetSlug,
                'recipient_email' => $recipientEmail,
                'sender_name' => $validated['name'],
                'sender_email' => $validated['email'],
                'ip_address' => $request->ip(),
            ]);

            if (! empty($portfolio?->user_id)) {
                app(LogService::class)->dispatchNotification(
                    recipientId: (int) $portfolio->user_id,
                    actorId: $request->user()?->id,
                    module: 'Portfolio',
                    type: 'info',
                    message: "New contact message from {$validated['name']} ({$validated['email']})",
                    title: 'New Contact Message',
                    actionUrl: '/admin/contacts'
                );
            }

            return redirect()->back()->with('success', 'Message sent successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to send message: '.$e->getMessage());

            return redirect()->back()->with('error', 'Failed to send message. Please try again later.');
        }
    }
}
