<?php

namespace Orbit\Console\Commands;

use App\Models\User;
use Spark\Console\Prompt;
use Spark\Database\Migration;

class Install
{
    public function __invoke(Prompt $prompt)
    {
        $migration = new Migration(
            migrationsFolder: orbit_path("/database/migrations"),
            migrationFile: orbit_path("/database/migrations.json")
        );

        $migration->refresh([]);

        $assetsDir = orbit_path("/resources/assets");
        $publicDir = root_dir("/public/assets");

        fm()->ensureDirectoryExists($publicDir);
        fm()->link($assetsDir, "$publicDir/orbit");

        $prompt->message('Assets published to public directory.', 'info');

        if ($prompt->confirm('Do you want create an admin user?', true)) {
            $name = $prompt->ask('Username: ');
            $email = $prompt->ask('Email: ');
            $password = $prompt->ask('Password: ');

            $user = User::firstOrCreate([
                'name' => $name,
                'email' => $email,
            ], [
                'password' => $password,
            ]);

            if ($user->wasCreated()) {
                $prompt->message('Admin user created successfully.', 'success');
            } else {
                $prompt->message('Admin user already exists.', 'warning');
            }
        }
    }
}