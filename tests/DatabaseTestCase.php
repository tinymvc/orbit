<?php

namespace Tests;

use App\Models\Role;
use App\Models\User;

abstract class DatabaseTestCase extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        foreach (glob(dirname(__DIR__) . '/database/migrations/migration_*.php') as $file) {
            (require $file)->up();
        }
    }

    protected function makeUser(array $privileges = [], string $username = 'tester'): User
    {
        $user = User::create([
            'first_name' => 'Test', 'last_name' => 'User',
            'username' => $username, 'email' => "$username@example.test",
            'password' => 'Password123!', 'status' => 'active',
        ]);
        if ($privileges) {
            $role = Role::create(['name' => $username, 'slug' => $username, 'privileges' => $privileges]);
            $user->roles()->sync([$role->id]);
        }
        return $user;
    }

    protected function signIn(array $privileges = ['all.access']): User
    {
        $user = $this->makeUser($privileges);
        $this->actingAs($user);
        $this->withSession(['csrf_token' => 'test-csrf']);
        $this->withHeaders(['X-CSRF-TOKEN' => 'test-csrf', 'X-Inertia' => 'true', 'Referer' => '/admin',
            'X-Inertia-Version' => \Inertia\Inertia::instance()->getVersion()]);
        return $user;
    }
}
