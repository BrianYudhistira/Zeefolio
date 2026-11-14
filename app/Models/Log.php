<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Log extends Model
{
    use MassPrunable;

    protected $fillable = [
        'user_id',
        'ip_address',
        'location',
        'user_agent',
        'message',
        'type',
        'module',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the prunable model query (retain 180 days of logs).
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<=', now()->subDays(180));
    }
}
