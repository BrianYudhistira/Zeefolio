<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Home extends Model
{
    use HasFactory;

    protected $table = 'home';

    protected $fillable = [
        'portfolio_user_id',
        'greeting',
        'name',
        'passions',
        'description',
        'logo_path',
        'image_path',
        'cv_path',
        'social_media_links',
    ];

    protected $casts = [
        'social_media_links' => 'array',
        'passions' => 'array',
    ];

    protected $appends = [
        'logo_url',
        'image_url',
        'cv_url',
    ];

    /**
     * Get the portfolio user that owns the home data.
     */
    public function portfolioUser(): BelongsTo
    {
        return $this->belongsTo(PortfolioUser::class);
    }

    /**
     * Get the logo URL attribute.
     */
    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo_path ? asset($this->logo_path) : null;
    }

    /**
     * Get the profile image URL attribute.
     * (Formerly stored in the `about` table, now merged into `home`.)
     */
    public function getImageUrlAttribute(): ?string
    {
        if (empty($this->image_path)) {
            return null;
        }
        return asset('storage/' . ltrim($this->image_path, '/'));
    }

    /**
     * Get the CV / resume URL attribute.
     * (Formerly stored in the `about` table, now merged into `home`.)
     */
    public function getCvUrlAttribute(): ?string
    {
        if (empty($this->cv_path)) {
            return null;
        }
        return asset('storage/' . ltrim($this->cv_path, '/'));
    }
}