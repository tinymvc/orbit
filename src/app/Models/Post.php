<?php

namespace Orbit\Models;

use Spark\Database\Model;

class Post extends Model
{
    public static string $table = 'posts';

    protected array $guarded = [];
}
