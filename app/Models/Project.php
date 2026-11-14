<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'portfolio_user_id',
        'type',
        'title',
        'slug',
        'project_type',
        'description',
        'image_path',
        'demo_url',
        'source_url',
        'tech_stack',
        'sort_order',
        'is_featured',
        'is_active',
    ];

    protected $attributes = [
        'tech_stack' => '[]',
    ];

    protected $casts = [
        'tech_stack' => 'array',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'image_url',
    ];

    /**
     * Normalize a raw or legacy JSON-encoded image_path into a clean string path.
     */
    public static function normalizeImagePath(mixed $value): ?string
    {
        if (is_array($value)) {
            foreach ($value as $item) {
                if (is_string($item) && trim($item) !== '') {
                    return trim($item);
                }
            }

            return null;
        }

        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        $trimmed = trim($value);

        $guard = 0;
        while (
            $guard++ < 5 &&
            ((str_starts_with($trimmed, '"') && str_ends_with($trimmed, '"')) ||
             (str_starts_with($trimmed, '[') && str_ends_with($trimmed, ']')))
        ) {
            $decoded = json_decode($trimmed, true);
            if (is_string($decoded)) {
                $trimmed = trim($decoded);
            } elseif (is_array($decoded)) {
                $first = collect($decoded)->first(fn ($p) => is_string($p) && trim($p) !== '');
                $trimmed = is_string($first) ? trim($first) : '';
                break;
            } else {
                break;
            }
        }

        return $trimmed !== '' ? $trimmed : null;
    }

    public function getImagePathAttribute(mixed $value): ?string
    {
        return self::normalizeImagePath($value);
    }

    /**
     * Get the portfolio user that owns the project.
     */
    public function portfolioUser(): BelongsTo
    {
        return $this->belongsTo(PortfolioUser::class);
    }

    /**
     * Tech stacks used in this project (many-to-many).
     */
    public function techStacks(): BelongsToMany
    {
        return $this->belongsToMany(TechStack::class, 'project_tech_stack')
            ->withPivot('sort_order')
            ->orderByPivot('sort_order')
            ->withTimestamps();
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProjectImage::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        $imagePath = $this->image_path;

        if (! $imagePath) {
            return null;
        }

        if (str_starts_with($imagePath, 'http://') || str_starts_with($imagePath, 'https://')) {
            return $imagePath;
        }

        return asset('storage/' . ltrim($imagePath, '/'));
    }
}
