<?php

namespace App\Http\Controllers\Admin\Concerns;

use App\Models\PortfolioUser;
use App\Services\PortfolioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

trait ResolvesAdminPortfolio
{
    protected function resolvePortfolio(Request $request, PortfolioService $portfolioService): PortfolioUser
    {
        $user = $request->user();

        return $user->portfolioUser()->first() ?? $portfolioService->createDefaultPortfolio($user);
    }

    protected function clearPortfolioCache(Request $request): void
    {
        $userId = $request->user()->id;
        Cache::forget("portfolio:user:{$userId}");
        Cache::forget("user:{$userId}");
    }
}

