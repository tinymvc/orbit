<?php

namespace App\Models;

use Spark\Database\Model;

class Post extends Model
{
    protected const USE_SOFT_DELETES = true;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_PUBLISHED = 'published';
    public const STATUS_ARCHIVED = 'archived';
    public const STATUS_SCHEDULED = 'scheduled';

    protected array $casts = [
        'published_at' => 'datetime',
        'scheduled_at' => 'datetime',
    ];

    public function user(): \Spark\Database\Relation\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function categories(): \Spark\Database\Relation\BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }
}
