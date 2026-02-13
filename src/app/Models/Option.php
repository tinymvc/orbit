<?php

namespace Orbit\Models;

use Spark\Database\Model;

class Option extends Model
{
    public static string $table = 'options';

    protected array $guarded = [];

    protected array $casts = [
        'autoload' => 'boolean',
        'option_value' => 'json',
    ];
}
