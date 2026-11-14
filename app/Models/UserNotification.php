<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserNotification extends Model
{
    use MassPrunable, SoftDeletes;

    protected $table = 'user_notifications';

    protected $fillable = [
        'user_id',
        'actor_id',
        'module',
        'type',
        'title',
        'message',
        'action_url',
        'is_popup_hidden',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'is_popup_hidden' => 'boolean',
            'read_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function prunable(): Builder
    {
        return static::withTrashed()->where('created_at', '<=', now()->subDays(90));
    }
}
