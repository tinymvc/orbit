<?php

namespace App\Models;

use App\Security\HasRoles;
use Spark\Database\Events;
use Spark\Database\Model;
use Spark\Database\Relation\HasMany;
use Spark\Facades\Auth;

class User extends Model
{
    use HasRoles;

    protected array $guarded = [
        'remember_token',
    ];

    protected array $hidden = [
        'password',
        'remember_token',
    ];

    protected array $casts = [
        'password' => 'hashed',
    ];

    protected array $appends = [
        'display_name',
        'avatar_url',
        'privileges',
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

    public function events(): Events
    {
        return Events::make(changed: fn() => $this->id && Auth::clearCache($this->id));
    }
}
