<?php

namespace App\Models;

use Spark\Database\Relation\BelongsToMany;

trait HasRoles
{
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'roles_users', 'user_id', 'role_id');
    }
}