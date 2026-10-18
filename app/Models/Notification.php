<?php

namespace App\Models;

use Spark\Database\Model;

class Notification extends Model
{
    protected const UPDATED_AT = null;

    public function user(): \Spark\Database\Relation\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getCreatedAtAttribute($value)
    {
        return carbon($value)->diffForHumans();
    }
}
