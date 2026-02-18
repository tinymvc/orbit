<?php

use App\Models\User;
use App\Security\Privileges;

return new class {
    public function up(): void
    {
        User::firstOrCreate(
            attributes: ['email' => 'shahin.moyshan2@gmail.com'],
            values: [
                'username' => 'shahin',
                'first_name' => 'Shahin',
                'last_name' => 'Moyshan',
                'password' => bcrypt('password'),
                'privileges' => Privileges::list(false)->dot()->keys()
            ]
        );
    }

    public function down(): void
    {
        User::delete('1=1');
    }
};