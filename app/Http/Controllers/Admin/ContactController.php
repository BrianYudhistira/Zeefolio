<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ResolvesAdminPortfolio;
use App\Http\Controllers\Controller;
use App\Services\LogService;
use App\Services\PortfolioService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    use ResolvesAdminPortfolio;

    public function __construct(
        protected PortfolioService $portfolioService,
        protected LogService $logService,
    ) {}

    public function index(Request $request): Response
    {
        $portfolio = $this->resolvePortfolio($request, $this->portfolioService);
        $contact = $portfolio->contacts()->first();

        return Inertia::render('Admin/Contacts/Index', [
            'contact' => $contact,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $this->resolvePortfolio($request, $this->portfolioService);

        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        $this->portfolioService->editContactsSection($request->user(), $validated);
        $this->logService->infoLog('Portfolio', 'Updated contact information');

        return redirect()->back()->with('success', 'Contact information updated successfully.');
    }
}

