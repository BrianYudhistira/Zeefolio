<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    public const ROLE_SUPERADMIN = 'superadmin';
    public const ROLE_ADMIN = 'admin';
    public const ROLE_MEMBER = 'member';

    public function isSuperAdmin(): bool
    {
        if ($this->role === self::ROLE_SUPERADMIN) {
            return true;
        }

        try {
            return $this->hasRole(self::ROLE_SUPERADMIN);
        } catch (\Throwable) {
            return false;
        }
    }

    public function isAdmin(): bool
    {
        if ($this->role === self::ROLE_ADMIN) {
            return true;
        }

        try {
            return $this->hasRole(self::ROLE_ADMIN);
        } catch (\Throwable) {
            return false;
        }
    }

    public function isAdminOrAbove(): bool
    {
        if (in_array($this->role, [self::ROLE_SUPERADMIN, self::ROLE_ADMIN], true)) {
            return true;
        }

        try {
            return $this->hasAnyRole([self::ROLE_SUPERADMIN, self::ROLE_ADMIN]);
        } catch (\Throwable) {
            return false;
        }
    }

    public function isMember(): bool
    {
        return ! $this->isAdminOrAbove();
    }

    /**
     * Check if the user has a specific Spatie permission (or is superadmin).
     */
    public function hasAccessPermission(string $permission): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        try {
            return $this->hasPermissionTo($permission);
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * Sync Spatie role and keep the `role` column in sync.
     */
    public function syncUserRole(string $roleName): void
    {
        $this->update(['role' => $roleName]);

        try {
            $this->syncRoles([$roleName]);
        } catch (\Throwable) {
            // Ignore if tables not yet created
        }
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'username',
        'password',
        'photo_path',
        'role',
        'status',
        'bio',
        'email_verified_at',
        'last_login_at',
        'ip_address',
        'location',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'photo_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login_at' => 'datetime',
        ];
    }

    /**
     * Get the portfolio associated with the user.
     */
    public function portfolioUser(): HasOne
    {
        return $this->hasOne(PortfolioUser::class);
    }

    public function logs()
    {
        return $this->hasMany(Log::class);
    }

    /**
     * Get the full URL for the user's photo.
     */
    public function getPhotoUrlAttribute(): ?string
    {
        if (!$this->photo_path) {
            return null;
        }

        // Jika sudah berupa URL lengkap, return as is
        if (str_starts_with($this->photo_path, 'http')) {
            return $this->photo_path;
        }

        // Convert path relatif ke URL absolut
        return asset('storage/' . $this->photo_path);
    }
}
