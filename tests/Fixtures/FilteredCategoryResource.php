<?php

namespace Tests\Fixtures;

use App\Http\Resources\CategoriesResource;
use App\Services\Bread\Table\Filter;

final class FilteredCategoryResource extends CategoriesResource
{
    protected static string $slug = 'filtered-categories';

    public static function filters(): array
    {
        return [
            Filter::make('name')->queryKey('names')->multiple(),
            Filter::make('slug')->queryKey('exclude_slugs')->multiple()->exclude(),
        ];
    }

    public static function advancedFilterFields(): array
    {
        return [
            ['key' => 'name', 'label' => 'Name', 'type' => 'text'],
            ['key' => 'description', 'label' => 'Description', 'type' => 'text'],
            ['key' => 'created_at', 'label' => 'Created', 'type' => 'date'],
            ['key' => 'id', 'label' => 'ID', 'type' => 'number'],
        ];
    }

    public static function editor(): array { return ['style' => 'modal', 'width' => '3xl']; }
    public static function pageSizeOptions(): array { return [10, 20, 100]; }
}
