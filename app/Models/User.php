<?php

namespace App\Models;

use Spark\Database\Model;

class User extends Model
{
    protected array $guarded = [
        'remember_token',
    ];

    protected array $hidden = [
        'password',
        'remember_token',
    ];

    protected array $casts = [
        'password' => 'hashed',
        'privileges' => 'collection',
    ];

    protected array $appends = [
        'display_name',
        'avatar_url',
    ];

    public function getCreatedAtAttribute($value): string
    {
        return carbon($value)->toFormattedDateString();
    }

    public function getDisplayNameAttribute(): string
    {
        if (!empty($this->attributes['first_name'])) {
            return trim($this->attributes['first_name'] . " " . ($this->attributes['last_name'] ?? ''));
        }

        return '@' . $this->attributes['username'];
    }

    public function getAvatarUrlAttribute(): string
    {
        return get_gravatar_url($this->attributes['email'] ?? '', 100);
    }
}
