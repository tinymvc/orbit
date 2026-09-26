<?php

namespace Tests\Feature;

use App\Http\Resources\PostsResource;
use App\Models\Category;
use App\Models\Post;
use App\Services\Bread\ResourceController;
use Spark\Facades\Storage;
use Spark\Database\Schema\Schema;
use Tests\DatabaseTestCase;
use Tests\Fixtures\UploadResource;

final class BreadSoftDeleteTest extends DatabaseTestCase
{
    private function makePost(int $userId, string $slug, array $extra = []): Post
    {
        return Post::create([
            'user_id' => $userId,
            'title' => ucfirst($slug),
            'slug' => $slug,
            'excerpt' => 'Summary',
            'content' => 'Body',
            'status' => 'draft',
            ...$extra
        ]);
    }

    public function test_posts_migration_includes_soft_deletes_and_supports_rollback(): void
    {
        $migration = require dirname(__DIR__, 2) . '/database/migrations/migration_2026_02_24_042730_posts.php';
        $migration->down();
        $this->assertFalse(Schema::hasTable('posts'));
        $migration->up();
        $this->assertTrue(Schema::hasColumn('posts', 'deleted_at'));
        $user = $this->signIn();
        $post = $this->makePost($user->id, 'existing');
        $this->assertFalse(Post::findOrFail($post->id)->trashed());
        $this->assertDatabaseHas('posts', ['id' => $post->id, 'deleted_at' => null]);
    }

    public function test_trash_views_preserve_search_filters_sort_and_pagination(): void
    {
        $user = $this->signIn();
        $active = $this->makePost($user->id, 'alpha');
        $trashed = $this->makePost($user->id, 'beta');
        $published = $this->makePost($user->id, 'gamma', ['status' => 'published']);
        $trashed->remove();
        $published->remove();
        $this->get('/admin/posts')->assertOk()->assertJsonPath('props.paginated.total', 1)
            ->assertJsonPath('props.paginated.data.0.id', $active->id)
            ->assertJsonPath('props.resource.softDeletes.column', 'deleted_at')
            ->assertJsonPath('props.resource.permissions.restore', 'posts.restore')
            ->assertJsonPath('props.resource.permissions.forceDelete', 'posts.force_delete');
        $this->get('/admin/posts?trashed=without')->assertJsonPath('props.paginated.total', 1);
        $this->get('/admin/posts?trashed=with&sort=title&direction=asc&per_page=1&page=2')->assertOk()
            ->assertJsonPath('props.paginated.total', 3)->assertJsonPath('props.paginated.data.0.id', $trashed->id);
        $this->get('/admin/posts?trashed=only')->assertJsonPath('props.paginated.total', 2);
        $this->get('/admin/posts?trashed=only&search=beta&status=draft')->assertOk()
            ->assertJsonPath('props.paginated.total', 1)->assertJsonPath('props.paginated.data.0.id', $trashed->id);
        $this->get('/admin/posts?trashed=only&search=alpha')->assertJsonPath('props.paginated.total', 0);
        foreach (['trashed=invalid', 'trashed[]=only'] as $query) {
            $this->getJson('/admin/posts?' . $query)->assertUnprocessable()->assertJsonValidationErrors(['trashed']);
        }
    }

    public function test_trash_and_restore_preserve_uploads_and_category_links_until_permanent_deletion(): void
    {
        $user = $this->signIn();
        Storage::disk('public')->put('posts/keep.txt', 'keep');
        $post = $this->makePost($user->id, 'keep', ['thumbnail' => 'posts/keep.txt']);
        $category = Category::create(['name' => 'News', 'slug' => 'news']);
        $post->categories()->sync([$category->id]);
        $url = '/admin/posts/' . $post->id;
        $this->delete($url)->assertStatus(303);
        $this->assertFalse(Post::find($post->id));
        $this->assertTrue(Post::onlyTrashed()->findOrFail($post->id)->trashed());
        $this->assertTrue(Storage::disk('public')->exists('posts/keep.txt'));
        $this->assertDatabaseCount('categories_posts', 1);
        $this->post($url . '/restore')->assertStatus(302);
        $this->assertFalse(Post::findOrFail($post->id)->trashed());
        $this->assertDatabaseCount('categories_posts', 1);
        $this->assertTrue(Storage::disk('public')->exists('posts/keep.txt'));
        $this->delete($url)->assertStatus(303);
        $this->delete($url . '/force-delete')->assertStatus(303);
        $this->assertDatabaseCount('posts', 0);
        $this->assertDatabaseCount('categories_posts', 0);
        $this->assertFalse(Storage::disk('public')->exists('posts/keep.txt'));
        $this->assertDatabaseCount('categories', 1);
    }

    public function test_wrong_lifecycle_actions_cannot_edit_or_destroy_active_records(): void
    {
        $user = $this->signIn();
        $post = $this->makePost($user->id, 'states');
        $url = '/admin/posts/' . $post->id;
        $this->post($url . '/restore')->assertNotFound();
        $this->delete($url . '/force-delete')->assertNotFound();
        $this->assertDatabaseCount('posts', 1);
        $this->delete($url)->assertStatus(303);
        $deletedAt = Post::onlyTrashed()->findOrFail($post->id)->deleted_at;
        $this->delete($url)->assertNotFound();
        $this->put($url, ['title' => 'Changed'])->assertNotFound();
        $this->assertSame($deletedAt, Post::onlyTrashed()->findOrFail($post->id)->deleted_at);
        $this->delete('/admin/posts/99999/force-delete')->assertNotFound();
        $this->post('/admin/posts/99999/restore')->assertNotFound();
    }

    public function test_bulk_actions_scope_mixed_selections_and_keep_unselected_records(): void
    {
        $user = $this->signIn();
        $active = $this->makePost($user->id, 'active');
        $trash = $this->makePost($user->id, 'trash');
        $untouched = $this->makePost($user->id, 'untouched');
        $trash->remove();
        $ids = [$active->id, $trash->id, 99999];
        $this->post('/admin/posts/bulk-action', ['action' => 'published', 'ids' => $ids])->assertStatus(302);
        $this->assertSame('published', Post::findOrFail($active->id)->status);
        $this->assertSame('draft', Post::onlyTrashed()->findOrFail($trash->id)->status);
        $this->post('/admin/posts/bulk-action', ['action' => 'restore', 'ids' => $ids])->assertStatus(302);
        $this->assertSame(3, Post::count());
        $this->post('/admin/posts/bulk-action', ['action' => 'delete', 'ids' => [$trash->id, $trash->id]])->assertStatus(302);
        $this->post('/admin/posts/bulk-action', ['action' => 'force-delete', 'ids' => $ids])->assertStatus(302);
        $this->assertSame(2, Post::count());
        $this->assertTrue(Post::find($active->id) instanceof Post);
        $this->assertTrue(Post::find($untouched->id) instanceof Post);
        $this->assertFalse(Post::withTrashed()->find($trash->id));
    }

    public function test_restore_and_permanent_delete_require_separate_permissions(): void
    {
        $user = $this->signIn(['posts.browse', 'posts.delete', 'posts.edit']);
        $post = $this->makePost($user->id, 'restricted');
        $url = '/admin/posts/' . $post->id;
        $this->delete($url)->assertStatus(303);
        $this->post($url . '/restore')->assertForbidden();
        $this->delete($url . '/force-delete')->assertForbidden();
        foreach (['restore', 'force-delete'] as $action) {
            $this->post('/admin/posts/bulk-action', ['action' => $action, 'ids' => [$post->id]])->assertForbidden();
        }
        $restorer = $this->makeUser(['posts.restore'], 'restorer');
        $this->actingAs($restorer);
        $this->post($url . '/restore')->assertStatus(302);
        $this->delete($url)->assertForbidden();
        Post::findOrFail($post->id)->remove();
        $purger = $this->makeUser(['posts.force_delete'], 'purger');
        $this->actingAs($purger);
        $this->post($url . '/restore')->assertForbidden();
        $this->delete($url . '/force-delete')->assertStatus(303);
        $this->assertDatabaseCount('posts', 0);
    }

    public function test_trash_keeps_private_disk_previews_and_bulk_purge_removes_only_owned_keys(): void
    {
        $user = $this->signIn();
        UploadResource::$disk = 'local';
        try {
            ResourceController::routes(UploadResource::class)->prefix('files')->middleware('auth');
            Storage::disk('local')->put('posts/private.txt', 'private');
            Storage::disk('public')->put('posts/private.txt', 'different disk');
            $post = $this->makePost($user->id, 'private', ['thumbnail' => 'posts/private.txt']);
            $url = '/files/documents/' . $post->id;
            $this->post('/files/documents/bulk-action', ['action' => 'delete', 'ids' => [$post->id]])->assertStatus(302);
            $this->get($url . '/file?field=thumbnail&path=posts%2Fprivate.txt')->assertOk()->assertContent('private');
            $this->post('/files/documents/bulk-action', ['action' => 'restore', 'ids' => [$post->id]])->assertStatus(302);
            $this->assertTrue(Storage::disk('local')->exists('posts/private.txt'));
            $this->delete($url)->assertStatus(303);
            $this->post('/files/documents/bulk-action', ['action' => 'force-delete', 'ids' => [$post->id]])->assertStatus(302);
            $this->assertFalse(Storage::disk('local')->exists('posts/private.txt'));
            $this->assertTrue(Storage::disk('public')->exists('posts/private.txt'));
            $this->get($url . '/file?field=thumbnail&path=posts%2Fprivate.txt')->assertNotFound();
        } finally {
            UploadResource::$disk = 'public';
        }
    }

    public function test_bulk_selection_validation_and_non_soft_resources_remain_safe(): void
    {
        $this->signIn();
        foreach ([[], [0], [-1], ['1 OR 1=1'], [[1]], [true], array_fill(0, 501, 1)] as $ids) {
            $this->postJson('/admin/posts/bulk-action', ['action' => 'force-delete', 'ids' => $ids])
                ->assertUnprocessable()->assertJsonValidationErrors(['ids']);
        }
        $category = Category::create(['name' => 'Plain', 'slug' => 'plain']);
        $this->get('/admin/categories?trashed=with')->assertOk()->assertJsonPath('props.resource.softDeletes', null);
        $this->post('/admin/categories/' . $category->id . '/restore')->assertNotFound();
        $this->delete('/admin/categories/' . $category->id . '/force-delete')->assertNotFound();
        $this->post('/admin/categories/bulk-action', ['action' => 'force-delete', 'ids' => [$category->id]])->assertNotFound();
        $this->postJson('/admin/categories/bulk-action', ['action' => 'unknown', 'ids' => [$category->id]])->assertUnprocessable();
        $this->post('/admin/categories/bulk-action', ['action' => 'delete', 'ids' => [$category->id]])->assertStatus(302);
        $this->assertDatabaseCount('categories', 0);
    }

    public function test_generic_resources_support_a_custom_soft_delete_column(): void
    {
        $this->signIn();
        \Spark\Database\Schema\Schema::table('categories', function (\Spark\Database\Schema\Blueprint $table) {
            $table->timestamp('removed_at')->nullable();
        });
        $resource = new class extends \App\Http\Resources\CategoriesResource {
            protected static string $slug = 'soft-categories';
            protected static string $model = \Tests\Fixtures\SoftDeleteCategory::class;
        };
        ResourceController::routes($resource::class)->prefix('admin')->middleware('auth');
        $category = \Tests\Fixtures\SoftDeleteCategory::create(['name' => 'Custom', 'slug' => 'custom']);
        $url = '/admin/soft-categories/' . $category->id;
        $this->delete($url)->assertStatus(303);
        $this->get('/admin/soft-categories')->assertJsonPath('props.paginated.total', 0)
            ->assertJsonPath('props.resource.softDeletes.column', 'removed_at');
        $this->get('/admin/soft-categories?trashed=only')->assertJsonPath('props.paginated.total', 1);
        $this->post($url . '/restore')->assertStatus(302);
        $this->get('/admin/soft-categories')->assertJsonPath('props.paginated.total', 1);
        $this->delete($url)->assertStatus(303);
        $this->delete($url . '/force-delete')->assertStatus(303);
        $this->assertDatabaseCount('categories', 0);
    }

    public function test_single_and_bulk_lifecycle_hooks_run_for_each_eligible_record(): void
    {
        $user = $this->signIn();
        $resource = new class extends PostsResource {
            protected static string $slug = 'hooked-posts';
            public static array $events = [];
            public static function beforeDelete($record): void
            {
                static::$events[] = ['delete', $record->id];
            }
            public static function beforeRestore($record): void
            {
                static::$events[] = ['restoring', $record->id];
            }
            public static function afterRestore($record): void
            {
                static::$events[] = ['restored', $record->id, $record->trashed()];
            }
            public static function beforeForceDelete($record): void
            {
                static::$events[] = ['purge', $record->id];
            }
        };
        ResourceController::routes($resource::class)->prefix('admin')->middleware('auth');
        $post = $this->makePost($user->id, 'hooks');
        $this->delete('/admin/hooked-posts/' . $post->id)->assertStatus(303);
        $this->post('/admin/hooked-posts/bulk-action', ['action' => 'restore', 'ids' => [$post->id]])->assertStatus(302);
        $this->post('/admin/hooked-posts/bulk-action', ['action' => 'delete', 'ids' => [$post->id]])->assertStatus(302);
        $this->delete('/admin/hooked-posts/' . $post->id . '/force-delete')->assertStatus(303);
        $this->assertSame([
            ['delete', $post->id],
            ['restoring', $post->id],
            ['restored', $post->id, false],
            ['delete', $post->id],
            ['purge', $post->id]
        ], $resource::$events);
    }
}
