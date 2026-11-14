<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PortfolioView extends Model
{
    use MassPrunable;

    public $timestamps = false;

    protected $fillable = [
        'portfolio_user_id',
        'page',
        'project_id',
        'ip_hash',
        'user_agent',
        'viewed_at',
    ];

    protected $casts = [
        'viewed_at' => 'datetime',
    ];

    public function portfolioUser(): BelongsTo
    {
        return $this->belongsTo(PortfolioUser::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the prunable model query (retain 366 days of raw view events).
     */
    public function prunable(): Builder
    {
        return static::where('viewed_at', '<=', now()->subDays(366));
    }
}


