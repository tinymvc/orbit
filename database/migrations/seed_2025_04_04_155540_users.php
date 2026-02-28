<?php

use App\Models\Role;
use App\Models\User;

return new class {
    public function up(): void
    {
        $role = Role::create([
            'name' => 'Admin',
            'slug' => 'admin',
            'privileges' => ['all.access'],
        ]);

        $user = User::firstOrCreate(
            attributes: ['email' => 'admin@hotmail.com'],
            values: [
                'username' => 'admin',
                'first_name' => 'John',
                'last_name' => 'Doe',
                'password' => bcrypt('password'),
                'status' => User::STATUS_ACTIVE,
            ]
        );

        $user->roles()->sync($role->id);
    }

    public function down(): void
    {
        Role::delete('1=1');
        User::delete('1=1');
    }
};