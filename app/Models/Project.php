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

    protected $casts = [
        'image_path' => 'array',
        'tech_stack' => 'array',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'image_url',
    ];

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
        if (empty($this->image_path)) {
            return null;
        }

        $imagePath = $this->image_path;
        if (is_array($imagePath)) {
            foreach ($imagePath as $path) {
                if (!empty($path)) {
                    $imagePath = $path;
                    break;
                }
            }
        }

        if (empty($imagePath) || is_array($imagePath)) {
            return null;
        }

        return asset('storage/' . ltrim($imagePath, '/'));
    }
}
