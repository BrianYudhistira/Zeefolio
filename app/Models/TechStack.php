<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TechStack extends Model
{
    use HasFactory;

    protected $table = 'tech_stacks';

    protected $fillable = [
        'name',
        'icon',
        'category_id',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(TechStackCategory::class, 'category_id');
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
