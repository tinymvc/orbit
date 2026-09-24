<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Post;
use Tests\DatabaseTestCase;

final class BreadTest extends DatabaseTestCase
{
    public function test_category_crud_validation_search_and_flash(): void
    {
        $this->signIn();
        $this->post('/admin/categories', ['name' => 'Technology', 'slug' => 'technology', 'description' => 'News'])
            ->assertStatus(302);
        $category = Category::first();
        $this->assertDatabaseHas('categories', ['name' => 'Technology']);
        $this->get('/admin/categories?search=Tech')->assertOk()->assertJsonPath('props.paginated.total', 1)
            ->assertJsonPath('flash.success', 'Category created successfully.');
        $this->postJson('/admin/categories', ['name' => '', 'slug' => 'technology'])
            ->assertUnprocessable()->assertJsonValidationErrors(['name', 'slug']);
        $this->put('/admin/categories/' . $category->id, ['name' => 'Updated', 'slug' => 'technology'])
            ->assertStatus(303);
        $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => 'Updated']);
        $this->delete('/admin/categories/' . $category->id)->assertStatus(303);
        $this->assertDatabaseCount('categories', 0);
        $this->delete('/admin/categories/99999')->assertNotFound();
    }

    public function test_posts_sync_categories_search_filter_and_bulk_actions(): void
    {
        $user = $this->signIn();
        $category = Category::create(['name' => 'Tech', 'slug' => 'tech']);
        $data = [
            'title' => 'Test post',
            'slug' => 'test-post',
            'user_id' => $user->id,
            'status' => 'draft',
            'excerpt' => 'Summary',
            'content' => 'Body',
            'categories' => [$category->id]
        ];
        $this->post('/admin/posts', $data)->assertStatus(302);
        $post = Post::first();
        $this->assertDatabaseHas('categories_posts', ['post_id' => $post->id, 'category_id' => $category->id]);
        $this->get('/admin/posts?search=Test&status=draft&category_id=' . $category->id)
            ->assertOk()->assertJsonPath('props.paginated.total', 1);
        $this->put('/admin/posts/' . $post->id, [...$data, 'categories' => []])->assertStatus(303);
        $this->assertDatabaseCount('categories_posts', 0);
        $this->post('/admin/posts/bulk-action', ['action' => 'published', 'ids' => [$post->id]])->assertStatus(302);
        $this->assertDatabaseHas('posts', ['id' => $post->id, 'status' => 'published']);
        $this->post('/admin/posts/bulk-action', ['action' => 'delete', 'ids' => [$post->id]])->assertStatus(302);
        $this->assertSame(0, Post::count());
        $this->assertSame(1, Post::onlyTrashed()->count());
        $this->assertDatabaseCount('posts', 1);
    }

    public function test_resource_sort_direction_and_update_hooks_are_honored(): void
    {
        $this->signIn();
        \App\Services\Bread\ResourceController::routes(\Tests\Fixtures\HookedCategoryResource::class)
            ->prefix('admin')->middleware('auth');
        $this->post('/admin/hooked-categories', ['name' => 'Zulu', 'slug' => 'zulu'])->assertStatus(302);
        $category = Category::first();
        $this->assertDatabaseHas('categories', ['id' => $category->id, 'description' => 'created']);
        $this->put('/admin/hooked-categories/' . $category->id, ['name' => 'Zulu', 'slug' => 'zulu'])->assertStatus(303);
        $this->assertDatabaseHas('categories', ['id' => $category->id, 'description' => 'updated']);
        $this->post('/admin/hooked-categories', ['name' => 'Alpha', 'slug' => 'alpha'])->assertStatus(302);
        $this->get('/admin/hooked-categories')->assertOk()->assertJsonPath('props.paginated.data.0.name', 'Alpha');
    }

    public function test_relationship_search_returns_options(): void
    {
        $user = $this->signIn();
        $this->getJson('/admin/posts/search?field=user_id&query=Test')
            ->assertOk()->assertJsonFragment(['value' => (string) $user->id, 'label' => 'Test User']);
        $this->getJson('/admin/posts/search?field=unknown')->assertNotFound();
    }

    public function test_permissions_protect_browse_write_search_and_bulk_actions(): void
    {
        $this->signIn([]);
        foreach (['/admin/posts', '/admin/categories', '/admin/users', '/admin/roles', '/admin/posts/search?field=user_id'] as $uri) {
            $this->getJson($uri)->assertForbidden();
        }
        $this->post('/admin/categories', ['name' => 'No', 'slug' => 'no'])->assertForbidden();
        $this->put('/admin/posts/1', [])->assertForbidden();
        $this->delete('/admin/posts/1')->assertForbidden();
        $this->post('/admin/posts/bulk-action', ['action' => 'published', 'ids' => [1]])->assertForbidden();
        $this->post('/admin/posts/bulk-action', ['action' => 'delete', 'ids' => [1]])->assertForbidden();
        $this->assertDatabaseCount('categories', 0);
    }
}
