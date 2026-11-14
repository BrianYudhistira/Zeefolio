<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contact extends Model
{
    use HasFactory;

    protected $table = 'contacts';

    protected $fillable = [
        'portfolio_user_id',
        'email',
        'phone',
        'address',
    ];

    /**
     * Get the portfolio user that owns the contact data.
     */
    public function portfolioUser(): BelongsTo
    {
        return $this->belongsTo(PortfolioUser::class);
    }
}
