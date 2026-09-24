<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Tests\DatabaseTestCase;

final class SeedTest extends DatabaseTestCase
{
    public function test_default_seeders_support_login_and_bread_deletion(): void
    {
        foreach (glob(dirname(__DIR__, 2) . '/database/migrations/seed_*.php') as $file) {
            (require $file)->up();
        }
        $admin = User::where('username', 'admin')->first();
        $this->assertTrue($admin->password('password'));
        $this->assertTrue($admin->can('posts.delete'));
        $this->assertDatabaseCount('categories', 5);
        $this->assertDatabaseCount('posts', 5);
        $this->actingAs($admin)->withSession(['csrf_token' => 'test-csrf'])
            ->withHeaders(['X-CSRF-TOKEN' => 'test-csrf']);
        $post = Post::first();
        $this->delete('/admin/posts/' . $post->id)->assertStatus(303);
        $this->assertDatabaseMissing('posts', ['id' => $post->id]);
    }
}
