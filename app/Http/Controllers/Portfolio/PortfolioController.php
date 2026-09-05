<?php

namespace App\Http\Controllers\Portfolio;

use App\Models\User;
use App\Models\PortfolioUser;
use App\Models\Project;
use App\Models\TechStack;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendMailToMe;

class PortfolioController
{
    public function index()
    {
        $user = User::findOrFail(1);
        $portfolio = $user->portfolioUser()->with([
            'home',
            'projects.techStacks',
            'contacts',
            'experiences',
            'userSkills.techStack'
        ])->first();

        if ($portfolio && $portfolio->experiences) {
            $allTechStacks = TechStack::all()->keyBy(function ($item) {
                return strtolower(trim($item->name));
            });

            foreach ($portfolio->experiences as $experience) {
                $rawList = array_filter(array_map('trim', explode(',', $experience->tech_stack ?? '')));
                $resolved = [];
                foreach ($rawList as $techName) {
                    $matched = $allTechStacks->get(strtolower($techName));
                    $resolved[] = [
                        'name' => $techName,
                        'icon' => $matched ? $matched->icon : null,
                    ];
                }
                $experience->tech_stacks = $resolved;
            }
        }

        return Inertia::render('Portfolio/Portfolio', [
            'portfolio' => $portfolio
        ]);
    }

    public function listProject()
    {
        $projects = Project::with(['techStacks', 'images'])
            ->orderBy('sort_order', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        if (! $projects) {
            abort(404, 'Projects not found');
        }

        return Inertia::render('Portfolio/Projects/ListProject', [
            'projects' => $projects,
        ]);
    }

    public function getProjectBySlug($slug)
    {
        $project = Project::with(['techStacks', 'images'])->where('slug', $slug)->first();

        if (! $project) {
            abort(404, 'Project not found');
        }

        return Inertia::render('Portfolio/Projects/DetailProject', [
            'project' => $project,
        ]);
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string',
        ]);

        try {
            Mail::to(env('MAIL_TO_ADDRESS'))->send(
                new SendMailToMe($request->name, $request->email, $request->message)
            );

            return redirect()->back()->with('success', 'Message sent successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to send message: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to send message. Please try again later.');
        }
    }
}
