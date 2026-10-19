<?php

namespace App\Models;

use Spark\Database\Model;
use Spark\Facades\Hash;
use function func_get_args;
use function is_array;

class User extends Model
{
    /** User status constants */
    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';
    public const STATUS_BANNED = 'banned';
    public const STATUS_SUSPENDED = 'suspended';

    protected array $guarded = [
        'remember_token',
    ];

    protected array $hidden = [
        'password',
        'remember_token',
    ];

    protected array $casts = [
        'password' => 'hashed',
        'email_verified_at' => 'datetime',
    ];

    protected array $appends = [
        'display_name',
        'avatar_url',
        'privileges',
    ];

    public function notifications(): \Spark\Database\Relation\HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function posts(): \Spark\Database\Relation\HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function roles(): \Spark\Database\Relation\BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
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

    public function hasRole(string|array $role): bool
    {
        $role = is_array($role) ? $role : func_get_args();
        foreach ($role as $r) {
            if ($this->roles->contains('slug', $r)) {
                return true;
            }
        }
        return false;
    }

    public function assignRole(string|array $role): void
    {
        $role = is_array($role) ? $role : func_get_args();

        $roleIds = Role::whereIn('slug', $role)
            ->pluck('id');

        $this->roles()->sync($roleIds, detaching: false);
    }

    public function removeRole(string|array $role): void
    {
        $role = is_array($role) ? $role : func_get_args();

        $roleIds = Role::whereIn('slug', $role)
            ->pluck('id');

        $this->roles()->detach($roleIds);
    }

    public function can(array|string $permission): bool
    {
        $permission = is_array($permission) ? $permission : func_get_args();
        $permission = ['all.access', ...$permission];

        foreach ($this->roles as $role) {
            if (
                $role->privileges->intersect($permission)
                    ->isNotEmpty()
            ) {
                return true;
            }
        }
        return false;
    }

    public function cannot(string|array $permission): bool
    {
        return !$this->can(...func_get_args());
    }

    public function authorize(string|array $permission): void
    {
        if (!$this->can(...func_get_args())) {
            throw new \Spark\Exceptions\Http\AuthorizationException('This action is unauthorized.');
        }
    }

    public function getPrivilegesAttribute()
    {
        $privileges = collect();
        foreach ($this->roles as $role) {
            $privileges = $privileges->merge($role->privileges);
        }

        return $privileges->unique();
    }

    public function password(string $password): bool
    {
        return Hash::verify($password, $this->password);
    }

    public function hasVerifiedEmail(): bool
    {
        return !empty($this->email_verified_at) && $this->status === 'active';
    }

}
