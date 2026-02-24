<?php

namespace App\Http\Resources;

use App\Models\Post;
use App\Models\User;
use App\Modules\Bread\Form\Field;
use App\Modules\Bread\Resource;
use App\Modules\Bread\Table\BulkAction;
use App\Modules\Bread\Table\Column;
use App\Modules\Bread\Table\Filter;
use Inertia\Facades\Props;

/**
 * Posts BREAD Resource — Filament-style fluent definition.
 *
 * This is the ONLY file you need to create per CRUD entity.
 * Everything else (controller, frontend page) is handled automatically.
 */
class PostsResource extends Resource
{
    // ─── Core ───────────────────────────────────────────────────────────

    protected static string $model = Post::class;
    protected static string $name = 'Post';
    protected static string $slug = 'posts';
    protected static null|string $title = 'Posts';
    protected static null|string $description = 'Manage blog posts, drafts, and scheduled publications.';

    protected static array $with = ['user:id,first_name,last_name,username'];
    protected static array $searchable = ['title', 'slug', 'excerpt'];

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
            Field::make('title')
                ->text()
                ->label('Title')
                ->required()
                ->maxLength(255)
                ->placeholder('Enter post title')
                ->columnSpan(2),

            Field::make('slug')
                ->slug()
                ->from('title')
                ->label('Slug')
                ->required()
                ->maxLength(255)
                ->unique('posts,slug')
                ->placeholder('auto-generated-from-title')
                ->description('URL-friendly version of the title. Auto-generated on create.'),

            Field::make('user_id')
                ->select()
                ->label('Author')
                ->required()
                ->options('dynamic:authors'),

            Field::make('status')
                ->select()
                ->label('Status')
                ->required()
                ->default('draft')
                ->options([
                    ['value' => 'draft', 'label' => 'Draft'],
                    ['value' => 'published', 'label' => 'Published'],
                    ['value' => 'archived', 'label' => 'Archived'],
                    ['value' => 'scheduled', 'label' => 'Scheduled'],
                ])
                ->in('draft,published,archived,scheduled'),

            Field::make('thumbnail')
                ->fileUpload()
                ->label('Thumbnail')
                ->uploadTo('posts')
                ->acceptedTypes(['jpg', 'jpeg', 'png', 'webp', 'gif'])
                ->maxFileSize(4096)
                ->compress(80)
                ->description('Upload a thumbnail image for the post.')
                ->columnSpan(2),

            Field::make('excerpt')
                ->textarea()
                ->label('Excerpt')
                ->required()
                ->maxLength(500)
                ->rows(3)
                ->placeholder('Brief summary of the post...')
                ->columnSpan(2),

            Field::make('content')
                ->richText()
                ->label('Content')
                ->required()
                ->rows(12)
                ->placeholder('Write the full post content here...')
                ->columnSpan(2),

            Field::make('published_at')
                ->dateTime()
                ->label('Published At')
                ->description('When the post was or will be published.')
                ->visibleWhen(['status' => 'published']),

            Field::make('scheduled_at')
                ->dateTime()
                ->label('Scheduled At')
                ->disablePastDates()
                ->description('Future date/time when the post should go live.')
                ->visibleWhen(['status' => 'scheduled']),
        ];
    }

    // ─── Table Columns ──────────────────────────────────────────────────

    public static function columns(): array
    {
        return [
            Column::make('title')
                ->clickToEdit()
                ->truncate(45),

            Column::make('user')
                ->header('Author')
                ->belongsTo()
                ->display(['first_name', 'last_name'])
                ->fallback('username'),

            Column::make('status')
                ->badge()
                ->badgeMap([
                    'draft' => ['label' => 'Draft', 'variant' => 'secondary'],
                    'published' => ['label' => 'Published', 'variant' => 'default'],
                    'archived' => ['label' => 'Archived', 'variant' => 'outline'],
                    'scheduled' => ['label' => 'Scheduled', 'variant' => 'secondary'],
                ]),

            Column::make('excerpt')
                ->truncate(60)
                ->hidden(),

            Column::make('published_at')
                ->header('Published')
                ->date(),

            Column::make('scheduled_at')
                ->header('Scheduled')
                ->date()
                ->hidden(),

            Column::make('created_at')
                ->header('Created')
                ->date(),
        ];
    }

    // ─── Filters ────────────────────────────────────────────────────────

    public static function filters(): array
    {
        return [
            Filter::make('status')
                ->label('Status')
                ->options([
                    ['value' => 'draft', 'label' => 'Draft'],
                    ['value' => 'published', 'label' => 'Published'],
                    ['value' => 'archived', 'label' => 'Archived'],
                    ['value' => 'scheduled', 'label' => 'Scheduled'],
                ]),

            Filter::make('user_id')
                ->label('Author')
                ->options('dynamic:authors'),
        ];
    }

    // ─── Bulk Actions ───────────────────────────────────────────────────

    public static function bulkActions(): array
    {
        return [
            BulkAction::make('published')->label('Publish Selected'),
            BulkAction::make('draft')->label('Move to Draft'),
            BulkAction::make('archived')->label('Archive Selected'),
            BulkAction::make('delete')->label('Delete Selected')->destructive(),
        ];
    }

    // ─── Extra Props (sent to frontend) ─────────────────────────────────

    public static function extraProps(): array
    {
        return [
            'dynamicOptions' => [
                'authors' => Props::once(
                    User::select(['id', 'first_name', 'last_name', 'username'])
                        ->map(fn($a) => [
                            'value' => (string) $a->id,
                            'label' => $a->display_name ?: $a->username,
                        ])->all(...)
                ),
            ],
        ];
    }

    // ─── Data Mutation ──────────────────────────────────────────────────

    public static function mutateBeforeCreate(array $data): array
    {
        if (empty($data['published_at']))
            unset($data['published_at']);
        if (empty($data['scheduled_at']))
            unset($data['scheduled_at']);

        return $data;
    }

    public static function mutateBeforeUpdate(array $data, $record): array
    {
        return static::mutateBeforeCreate($data);
    }
}
