<?php

namespace App\Security;

use Spark\Support\Collection;

class Privileges
{
    private const PRIVILEGES = [
        'dashboard' => [
            'overview' => 'View Dashboard Overview',
        ],
        'users' => [
            'browse' => 'View Users Table',
            'create' => 'Create Users',
            'edit' => 'Edit Users',
            'delete' => 'Delete Users',
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
