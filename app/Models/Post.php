<?php

namespace App\Models;

use Spark\Database\Model;

class Post extends Model
{
    public function user(): \Spark\Database\Relation\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getCreatedAtAttribute($value): string
    {
        return carbon($value)->toFormattedDateTimeString();
    }

    public function getPublishedAtAttribute($value): null|string
    {
        if (empty($value)) {
            return null;
        }
        return carbon($value)->toFormattedDateTimeString();
    }
}
