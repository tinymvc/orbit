<?php

use App\Models\Role;
use App\Models\User;
use App\Security\Privileges;

return new class {
    public function up(): void
    {
        $role = Role::create([
            'name' => 'Admin',
            'privileges' => Privileges::list(false)->dot()->keys(),
        ]);

        $user = User::firstOrCreate(
            attributes: ['email' => 'shahin.moyshan2@gmail.com'],
            values: [
                'username' => 'shahin',
                'first_name' => 'Shahin',
                'last_name' => 'Moyshan',
                'password' => bcrypt('password'),
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