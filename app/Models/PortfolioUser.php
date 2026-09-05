<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PortfolioUser extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'sections',
        'theme',
        'slug',
        'is_active',
    ];

    protected $casts = [
        'sections' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that owns the portfolio.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the home data for the portfolio.
     */
    public function home(): HasOne
    {
        return $this->hasOne(Home::class);
    }

    public function contacts(): HasOne
    {
        return $this->hasOne(Contact::class);
    }

    /**
     * Get all projects for the portfolio.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Get all experiences for the portfolio.
     */
    public function experiences(): HasMany
    {
        return $this->hasMany(Experience::class);
    }

    /**
     * Get all user skills for the portfolio.
     */
    public function userSkills(): HasMany
    {
        return $this->hasMany(UserSkills::class);
    }

    /**
     * Get featured projects for the portfolio.
     */
    public function featuredProjects(): HasMany
    {
        return $this->hasMany(Project::class)->where('is_featured', true)->orderBy('sort_order');
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Scope a query to only include active portfolios.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}