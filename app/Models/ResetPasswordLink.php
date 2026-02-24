<?php

namespace App\Models;

use Spark\Database\Model;

class ResetPasswordLink extends Model
{
    protected string $table = 'reset_password_links';

    public function user(): \Spark\Database\Relation\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
