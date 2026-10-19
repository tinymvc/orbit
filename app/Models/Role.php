<?php

namespace App\Models;

use Spark\Database\Model;
use Spark\Database\Relation\BelongsToMany;

class Role extends Model
{
    protected array $casts = [
        'privileges' => 'collection',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}
