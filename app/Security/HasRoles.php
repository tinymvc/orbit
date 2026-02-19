<?php

namespace App\Security;

use App\Models\Role;
use Spark\Database\Relation\BelongsToMany;
use Spark\Exceptions\Http\AuthorizationException;
use Spark\Support\Collection;
use function func_get_args;
use function is_array;

/**
 * Trait HasRoles
 *
 * Provides role-based access control functionality to the User model.
 */
trait HasRoles
{
    /**
     * Define the many-to-many relationship between users and roles.
     *
     * @return BelongsToMany
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'roles_users', 'user_id', 'role_id');
    }

    /**
     * Check if the user has a specific role or any of the given roles.
     *
     * @param string|array $role The role name or an array of role names to check against.
     * @return bool True if the user has at least one of the specified roles, false otherwise.
     */
    public function hasRole(string|array $role): bool
    {
        $role = is_array($role) ? $role : func_get_args();
        foreach ($role as $r) {
            if ($this->roles->contains('name', $r)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if the user has a specific permission through their roles.
     *
     * @param string|array $permission The permission name or an array of permission names to check against.
     * @return bool True if the user has at least one of the specified permissions, false otherwise.
     */
    public function can(array|string $permission): bool
    {
        $permission = is_array($permission) ? $permission : func_get_args();

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

    /**
     * Check if the user does not have a specific permission.
     *
     * @param string|array $permission The permission name or an array of permission names to check against.
     * @return bool True if the user does not have any of the specified permissions, false otherwise.
     */
    public function cannot(string|array $permission): bool
    {
        return !$this->can(...func_get_args());
    }

    /**
     * Authorize the user for a given permission.
     *
     * @param string|array $permission The permission name or an array of permission names to check against.
     * @throws AuthorizationException If the user does not have the required permission.
     */
    public function authorize(string|array $permission): void
    {
        if (!$this->can(...func_get_args())) {
            throw new AuthorizationException('This action is unauthorized.');
        }
    }

    /**
     * Get a collection of all privileges the user has through their roles.
     *
     * @return Collection A collection of unique privileges associated with the user's roles.
     */
    public function getPrivilegesAttribute(): Collection
    {
        $privileges = collect();
        foreach ($this->roles as $role) {
            $privileges = $privileges->merge($role->privileges);
        }

        return $privileges->unique();
    }

    /**
     * Verify if the provided password matches the user's stored password.
     *
     * @param string $password The plain text password to verify.
     * @return bool True if the password is correct, false otherwise.
     */
    public function password(string $password): bool
    {
        return \Spark\Facades\Hash::verify($password, $this->password);
    }
}
