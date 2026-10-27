<?php

namespace App\Http\Controllers\Portfolio;

use App\Http\Controllers\Controller;
use App\Mail\SendMailToMe;
use App\Services\PortfolioService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    public function __construct(
        protected PortfolioService $portfolioService,
    ) {}

    public function index(): Response
    {
        $portfolio = $this->portfolioService->getPublicPortfolio(1);

        return Inertia::render('Portfolio/Portfolio', [
            'portfolio' => $portfolio,
        ]);
    }

    public function listProject(): Response
    {
        $projects = $this->portfolioService->listProjects();

        return Inertia::render('Portfolio/Projects/ListProject', [
            'projects' => $projects,
        ]);
    }

    public function getProjectBySlug(string $slug): Response
    {
        $project = $this->portfolioService->getProjectBySlug($slug);

        if (! $project) {
            abort(404, 'Project not found');
        }

        return Inertia::render('Portfolio/Projects/DetailProject', [
            'project' => $project,
        ]);
    }

    public function sendMessage(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'message' => ['required', 'string'],
        ]);

        try {
            Mail::to(config('mail.to.address'))->send(
                new SendMailToMe($validated['name'], $validated['email'], $validated['message'])
            );

            return redirect()->back()->with('success', 'Message sent successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to send message: '.$e->getMessage());

            return redirect()->back()->with('error', 'Failed to send message. Please try again later.');
        }
    }
}
