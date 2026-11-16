<?php

namespace App\Models;

use App\Services\LogService;
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

    /**
     * Format the notification for Inertia frontend responses.
     *
     * @return array<string, mixed>
     */
    public function toPayload(?LogService $logService = null): array
    {
        $logService ??= app(LogService::class);

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'actor_id' => $this->actor_id,
            'module' => $this->module,
            'type' => $this->type,
            'title' => $this->title,
            'message' => $this->message,
            'action_url' => $this->action_url ?: $logService->resolveActionUrl($this->module, (string) $this->message),
            'is_popup_hidden' => (bool) $this->is_popup_hidden,
            'read_at' => $this->read_at?->toISOString(),
            'is_read' => $this->read_at !== null,
            'created_at' => $this->created_at?->toISOString(),
            'user' => $this->actor ? [
                'id' => $this->actor->id,
                'name' => $this->actor->name,
                'username' => $this->actor->username,
            ] : null,
        ];
    }
}
