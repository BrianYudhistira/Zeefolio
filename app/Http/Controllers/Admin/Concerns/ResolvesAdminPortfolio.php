<?php

namespace App\Http\Controllers\Admin\Concerns;

use App\Models\PortfolioUser;
use App\Services\PortfolioService;
use Illuminate\Http\Request;

trait ResolvesAdminPortfolio
{
    protected function resolvePortfolio(Request $request, PortfolioService $portfolioService): PortfolioUser
    {
        $user = $request->user();

        return $user->portfolioUser()->first() ?? $portfolioService->createDefaultPortfolio($user);
    }

    protected function clearPortfolioCache(Request $request): void
    {
        $userId = $request->user()?->id;
        if ($userId) {
            app(PortfolioService::class)->forgetUserPortfolioCache((int) $userId);
        }
    }
}


