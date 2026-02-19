<?php

namespace App\Models;

use Spark\Database\Model;

class Role extends Model
{
    protected array $casts = [
        'privileges' => 'collection',
    ];
}
