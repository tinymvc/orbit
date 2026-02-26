<?php

namespace App\Http\Resources;

use App\Models\Category;
use App\Modules\Bread\Form;
use App\Modules\Bread\Resource;
use App\Modules\Bread\Table;

/**
 * Categories BREAD Resource
 *
 * This is the ONLY file you need to create per CRUD entity.
 * Everything else (controller, frontend page) is handled automatically.
 */
class CategoriesResource extends Resource
{
    // ─── Core ───────────────────────────────────────────────────────────

    protected static string $model = Category::class;
    protected static string $name = 'Category';
    protected static string $slug = 'categories';
    protected static null|string $title = 'Categories';
    protected static null|string $description = 'Manage blog categories and their relationships.';

    protected static array $searchable = ['title', 'slug', 'description'];

    // ─── Permissions ────────────────────────────────────────────────────

    protected static null|string $browsePerm = 'posts.browse';
    protected static null|string $createPerm = 'posts.create';
    protected static null|string $editPerm = 'posts.edit';
    protected static null|string $deletePerm = 'posts.delete';

    // ─── Drawer ─────────────────────────────────────────────────────────

    protected static string $drawerWidth = 'lg';

    // ─── Form Fields ────────────────────────────────────────────────────

    public static function fields(): array
    {
        return [
            Form\TextInput::make('name')
                ->label('Name')
                ->required()
                ->maxLength(100)
                ->placeholder('Enter category name')
                ->columnSpan(2),

            Form\SlugInput::make('slug')
                ->from('name')
                ->label('Slug')
                ->required()
                ->maxLength(120)
                ->unique('categories,slug')
                ->placeholder('auto-generated-from-name')
                ->description('URL-friendly version of the name. Auto-generated on create.'),

            Form\Textarea::make('description')
                ->label('Description')
                ->maxLength(250)
                ->rows(3)
                ->placeholder('Brief summary of the category...')
                ->columnSpan(2),
        ];
    }

    // ─── Table Columns ──────────────────────────────────────────────────

    public static function columns(): array
    {
        return [
            Table\Column::make('name')
                ->clickToEdit()
                ->truncate(50),

            Table\Column::make('description')
                ->truncate(80),

            Table\Column::make('created_at')
                ->header('Created')
                ->date(),
        ];
    }
}
