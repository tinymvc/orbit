<?php

namespace App\Models;

use Spark\Database\Model;

class Category extends Model
{
    public function getCreatedAtAttribute($value)
    {
        return carbon($value)->toFormattedDateTimeString();
    }
}
