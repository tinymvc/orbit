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
            attributes: ['email' => 'shahin.moyshan2@gmail.com'],
            values: [
                'username' => 'shahin',
                'first_name' => 'Shahin',
                'last_name' => 'Moyshan',
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