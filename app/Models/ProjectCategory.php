<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectCategory extends Model
{
    use HasFactory;

    protected $table = 'project_categories';

    protected $fillable = [
        'name',
        'slug',
        'is_global',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'is_global' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Scope global default project categories.
     */
    public function scopeGlobal(Builder $query): Builder
    {
        return $query->where('is_global', true);
    }

    /**
     * Scope project categories available for a specific user (global defaults + user's own custom categories).
     */
    public function scopeAvailableFor(Builder $query, ?User $user): Builder
    {
        return $query->where(function (Builder $q) use ($user) {
            $q->where('is_global', true);

            if ($user) {
                $q->orWhere('user_id', $user->id);
            }
        });
    }
}

