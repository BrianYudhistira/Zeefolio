<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TechStack extends Model
{
    use HasFactory;

    protected $table = 'tech_stacks';

    protected $fillable = [
        'name',
        'icon',
        'category_id',
        'user_id',
        'is_global',
    ];

    protected function casts(): array
    {
        return [
            'is_global' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(TechStackCategory::class, 'category_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Scope global default skills.
     */
    public function scopeGlobal(Builder $query): Builder
    {
        return $query->where('is_global', true);
    }

    /**
     * Scope skills available for a specific user (global defaults + user's own custom skills).
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

    /**
     * Projects that use this tech stack.
     */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_tech_stack')
            ->withPivot('sort_order')
            ->orderByPivot('sort_order')
            ->withTimestamps();
    }
}
