<?php

namespace App\Models;

use Spark\Database\Model;

class Category extends Model
{
    protected array $fillable = [
        'name',
        'slug',
        'description',
    ];
}
