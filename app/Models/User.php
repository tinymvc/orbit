<?php

namespace App\Models;

use Spark\Database\Events;
use Spark\Database\Model;
use Spark\Facades\Auth;
use Spark\Facades\Hash;
use Spark\Facades\Mail;
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
    ];

    protected array $appends = [
        'display_name',
        'avatar_url',
        'privileges',
    ];

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

    public function getCreatedAtAttribute($value): string
    {
        return carbon($value)->toFormattedDateString();
    }

    public function getEmailVerifiedAtAttribute($value): null|string
    {
        if (empty($value)) {
            return null;
        }
        return carbon($value)->toFormattedDateTimeString();
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

    public function addRole(string|array $role): void
    {
        $role = is_array($role) ? $role : func_get_args();

        $roleIds = Role::whereIn('slug', $role)
            ->pluck('id');

        $this->roles()->sync($roleIds, detaching: false);
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

    public function sendPasswordResetNotification(): void
    {
        $token = Hash::random(60);
        $tokenEncrypted = Hash::encrypt($token);

        $mail = Mail::to($this->email, $this->display_name)
            ->subject('Password Reset Request')
            ->view('emails.password-reset', [
                'user' => $this,
                'token' => $tokenEncrypted,
            ]);

        if ($mail->send()) {
            ResetPasswordLink::insert([
                'user_id' => $this->id,
                'token' => $token,
                'created_at' => now(),
                'expires_at' => now()->addMinutes(60),
            ]);
        } else {
            throw new \Exception('Failed to send password reset email. Please try again later.');
        }
    }

    public function hasVerifiedEmail(): bool
    {
        return !empty($this->email_verified_at) && $this->status === 'active';
    }

    public function sendEmailVerificationNotification(): void
    {
        $token = Hash::encryptArray([
            'user_id' => $this->id,
            'timestamp' => now()->toDateTimeString(),
        ]);

        $mail = Mail::to($this->email, $this->display_name)
            ->subject('Email Verification')
            ->view('emails.email-verification', [
                'user' => $this,
                'token' => $token,
            ]);

        if (!$mail->send()) {
            throw new \Exception('Failed to send email verification. Please try again later.');
        }
    }
}
