<?php

namespace App\Security;

use Spark\Support\Collection;

class Privileges
{
    private const PRIVILEGES = [
        'dashboard' => [
            'overview' => 'View Dashboard Overview',
        ],
        'roles' => [
            'browse' => 'View Roles Table',
            'create' => 'Create Roles',
            'edit' => 'Edit Roles',
            'delete' => 'Delete Roles',
        ],
        'users' => [
            'browse' => 'View Users Table',
            'create' => 'Create Users',
            'edit' => 'Edit Users',
            'delete' => 'Delete Users',
        ],
        'posts' => [
            'browse' => 'View Posts Table',
            'create' => 'Create Posts',
            'edit' => 'Edit Posts',
            'delete' => 'Delete Posts',
        ],
        'settings' => [
            'general' => 'Manage General Settings',
        ],
    ];

    public static function list(bool $dotted = true): Collection
    {
        $list = collect(self::PRIVILEGES);

        if (!$dotted) {
            return $list;
        }

        return $list->map(
            fn($items, $key1) => collect($items)
                ->mapWithKeys(fn($item, $key2) => ["$key1.$key2" => $item])
                ->all()
        );
    }
}
