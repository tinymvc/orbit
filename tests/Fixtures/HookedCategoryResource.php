<?php

namespace Tests\Fixtures;

use App\Http\Resources\CategoriesResource;

final class HookedCategoryResource extends CategoriesResource
{
    protected static string $slug = 'hooked-categories';
    protected static string $orderBy = 'name';
    protected static string $orderDirection = 'asc';

    public static function mutateBeforeCreate(array $data): array
    {
        return [...$data, 'description' => 'created'];
    }

    public static function mutateBeforeUpdate(array $data, $record): array
    {
        return [...$data, 'description' => 'updated'];
    }
}
