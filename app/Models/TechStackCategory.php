<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;

class TechStackCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'user_id',
        'is_global',
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

    public function techStacks(): HasMany
    {
        return $this->hasMany(TechStack::class, 'category_id');
    }

    /**
     * Scope global default skill categories.
     */
    public function scopeGlobal(Builder $query): Builder
    {
        return $query->where('is_global', true);
    }

    /**
     * Scope skill categories available for a user (global defaults + user's own custom categories).
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
     * Build a validation rule ensuring a category ID is global or owned by the given user.
     */
    public static function availableExistsRule(?User $user): Exists
    {
        return Rule::exists('tech_stack_categories', 'id')->where(function ($query) use ($user): void {
            $query->where('is_global', true);

            if ($user) {
                $query->orWhere('user_id', $user->id);
            }
        });
    }

    /**
     * Find an existing category available to the user by name (case-insensitive) or create one.
     */
    public static function findOrCreateForUser(User $user, string $name, bool $makeGlobal = false): self
    {
        $normalized = trim($name);

        $existing = static::availableFor($user)
            ->whereRaw('LOWER(name) = ?', [Str::lower($normalized)])
            ->orderByDesc('is_global')
            ->first();

        if ($existing) {
            return $existing;
        }

        return static::create([
            'name' => $normalized,
            'user_id' => $makeGlobal ? null : $user->id,
            'is_global' => $makeGlobal,
        ]);
    }
}
