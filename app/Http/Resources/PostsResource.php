<?php

namespace App\Http\Resources;

use App\Models\Post;
use App\Models\User;
use App\Modules\Bread\Form\Combobox;
use App\Modules\Bread\Form\DatePicker;
use App\Modules\Bread\Form\FileUpload;
use App\Modules\Bread\Form\RichEditor;
use App\Modules\Bread\Form\Select;
use App\Modules\Bread\Form\SlugInput;
use App\Modules\Bread\Form\Textarea;
use App\Modules\Bread\Form\TextInput;
use App\Modules\Bread\Resource;
use App\Modules\Bread\Table\BulkAction;
use App\Modules\Bread\Table\Column;
use App\Modules\Bread\Table\Filter;

/**
 * Posts BREAD Resource
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

    protected static array $with = [
        'user:id,first_name,last_name,username,email',
        'categories:id,name'
    ];
    protected static array $searchable = ['title', 'slug', 'excerpt'];

    // ─── Permissions ────────────────────────────────────────────────────

    protected static null|string $browsePerm = 'posts.browse';
    protected static null|string $createPerm = 'posts.create';
    protected static null|string $editPerm = 'posts.edit';
    protected static null|string $deletePerm = 'posts.delete';

    // ─── Drawer ─────────────────────────────────────────────────────────

    protected static string $drawerWidth = 'xl';

    // ─── Form Fields ────────────────────────────────────────────────────

    public static function fields(): array
    {
        return [
            TextInput::make('title')
                ->label('Title')
                ->required()
                ->maxLength(255)
                ->placeholder('Enter post title')
                ->columnSpan(2),

            SlugInput::make('slug')
                ->from('title')
                ->label('Slug')
                ->required()
                ->maxLength(255)
                ->unique('posts,slug')
                ->placeholder('auto-generated-from-title')
                ->description('URL-friendly version of the title. Auto-generated on create.'),

            // Select::make('user_id')
            //     ->label('Author')
            //     ->required()
            //     ->dynamicOptions('authors'),

            Combobox::make('user_id')
                ->label('Author')
                ->required()
                ->belongsTo('user', 'id', 'username')
                ->searchRoute(self::getUrl())
                ->placeholder('Select author...')
                ->description('The author of the post.'),

            Combobox::make('categories')
                ->label('Categories')
                ->belongsToMany('categories', 'id', 'name')
                ->searchRoute(self::getUrl())
                ->placeholder('Select categories...')
                ->description('Assign one or more categories to this post.'),

            Select::make('status')
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

            DatePicker::make('published_at')
                ->withTime()
                ->label('Published At')
                ->description('When the post was or will be published.')
                ->visibleWhen(['status' => 'published'])
                ->fullWidth(),

            DatePicker::make('scheduled_at')
                ->withTime()
                ->label('Scheduled At')
                ->disablePastDates()
                ->description('Future date/time when the post should go live.')
                ->visibleWhen(['status' => 'scheduled'])
                ->fullWidth(),

            FileUpload::make('thumbnail')
                ->label('Thumbnail')
                ->uploadTo('posts')
                ->acceptedTypes(['jpg', 'jpeg', 'png', 'webp', 'gif'])
                ->maxFileSize(4096) // 4MB
                ->compress(80)
                ->description('Upload a thumbnail image for the post.')
                ->columnSpan(2),

            Textarea::make('excerpt')
                ->label('Excerpt')
                ->maxLength(500)
                ->rows(3)
                ->placeholder('Brief summary of the post...')
                ->columnSpan(2),

            RichEditor::make('content')
                ->label('Content')
                ->rows(12)
                ->placeholder('Write the full post content here...')
                ->columnSpan(2),
        ];
    }

    // ─── Table Columns ──────────────────────────────────────────────────

    public static function columns(): array
    {
        return [
            Column::make('title')
                ->clickToEdit()
                ->truncate(45),

            Column::make('thumbnail')
                ->header('Thumbnail')
                ->thumbnail(),

            Column::make('user')
                ->header('Author')
                ->avatar('avatar_url')
                ->display(['display_name']),

            Column::make('status')
                ->badge()
                ->badgeMap([
                    'draft' => ['label' => 'Draft', 'variant' => 'secondary'],
                    'published' => ['label' => 'Published', 'variant' => 'default'],
                    'archived' => ['label' => 'Archived', 'variant' => 'outline'],
                    'scheduled' => ['label' => 'Scheduled', 'variant' => 'secondary'],
                ]),

            Column::make('categories')
                ->header('Categories')
                ->tags()
                ->display(['name'])
                ->limit(3),

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
                ->hidden()
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

    // ─── Dynamic Props (sent to frontend) ─────────────────────────────────

    public static function dynamicProps(): array
    {
        return [
            'authors' => User::select(['id', 'first_name', 'last_name', 'username'])
                ->active()
                ->map(fn($a) => [
                    'value' => (string) $a->id,
                    'label' => $a->display_name ?: $a->username,
                ])->all(...),
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
