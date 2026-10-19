<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Post;
use App\Models\Role;
use App\Models\User;
use Spark\Facades\Hash;
use Tests\DatabaseTestCase;

final class ReleaseContractsTest extends DatabaseTestCase
{
    public function test_login_posts_are_throttled_without_throttling_the_form(): void
    {
        $this->withSession(['csrf_token' => 'test-csrf'])
            ->withHeaders(['X-CSRF-TOKEN' => 'test-csrf']);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/admin/login', ['user' => 'nobody', 'password' => 'WrongPassword123!'])
                ->assertUnprocessable();
        }

        $this->postJson('/admin/login', ['user' => 'nobody', 'password' => 'WrongPassword123!'])
            ->assertTooManyRequests();
        $this->get('/admin/login')->assertOk();
        $this->assertGuest();
    }

    public function test_reset_and_verification_endpoints_have_independent_throttles(): void
    {
        $this->withSession(['csrf_token' => 'test-csrf'])
            ->withHeaders(['X-CSRF-TOKEN' => 'test-csrf']);

        for ($attempt = 0; $attempt < 3; $attempt++) {
            $this->post('/admin/forgot-password', ['user' => 'nobody'])->assertStatus(302);
        }

        $this->post('/admin/forgot-password', ['user' => 'nobody'])->assertTooManyRequests();
        $this->get('/admin/forgot-password')->assertOk();
        $this->postJson('/admin/reset-password', [])->assertUnprocessable();
    }

    public function test_timestamp_inputs_store_utc_and_serialize_as_explicit_utc(): void
    {
        $user = $this->signIn();
        $data = [
            'title' => 'Timezone test',
            'slug' => 'timezone-test',
            'user_id' => $user->id,
            'status' => 'published',
            'published_at' => '2026-10-19T14:30:00+06:00',
        ];

        $this->post('/admin/posts', $data)->assertStatus(302);
        $post = Post::first();
        $this->assertDatabaseHas('posts', ['id' => $post->id, 'published_at' => '2026-10-19 08:30:00']);
        $this->get('/admin/posts')->assertOk()
            ->assertJsonPath('props.paginated.data.0.published_at', '2026-10-19T08:30:00.000000Z');

        $this->put('/admin/posts/' . $post->id, [
            ...$data,
            'published_at' => '2026-10-20T01:15:00.000Z',
        ])->assertStatus(303);
        $this->assertDatabaseHas('posts', ['id' => $post->id, 'published_at' => '2026-10-20 01:15:00']);
        $this->put('/admin/posts/' . $post->id, [...$data, 'published_at' => null])->assertStatus(303);
        $this->assertDatabaseHas('posts', ['id' => $post->id, 'published_at' => null]);
    }

    public function test_tables_share_the_native_laravel_paginator_contract(): void
    {
        $this->signIn();
        Category::create(['name' => 'First', 'slug' => 'first']);
        Category::create(['name' => 'Second', 'slug' => 'second']);

        foreach (['categories' => 'paginated', 'users' => 'users', 'roles' => 'roles'] as $route => $prop) {
            $response = $this->get("/admin/$route?per_page=1&page=999")->assertOk();
            $page = $response->json("props.$prop");
            $this->assertSame([
                'current_page', 'data', 'first_page_url', 'from', 'last_page',
                'last_page_url', 'links', 'next_page_url', 'path', 'per_page',
                'prev_page_url', 'to', 'total',
            ], array_keys($page));
            $this->assertSame($page['last_page'], $page['current_page']);
            $this->assertSame(1, $page['per_page']);
        }

        $this->get('/admin/categories?per_page=1&page=2')->assertOk()
            ->assertJsonPath('props.paginated.current_page', 2)
            ->assertJsonPath('props.paginated.from', 2)
            ->assertJsonPath('props.paginated.to', 2);
    }

    public function test_admin_requests_validate_nested_values_and_required_actions(): void
    {
        $this->signIn();
        $this->postJson('/admin/profile', [])->assertJsonValidationErrors('action');
        $this->postJson('/admin/roles', [
            'name' => 'Invalid', 'slug' => 'invalid', 'privileges' => ['unknown.permission'],
        ])->assertJsonValidationErrors('privileges.0');
        $this->assertDatabaseMissing('roles', ['slug' => 'invalid']);
        $this->postJson('/admin/users', [
            'username' => 'invalid', 'email' => 'invalid@example.test',
            'password' => 'Password123!', 'password_confirmation' => 'Password123!',
            'roles' => [9999],
        ])->assertJsonValidationErrors('roles.0');
        $this->assertDatabaseMissing('users', ['username' => 'invalid']);
        $this->postJson('/admin/users/bulk-action', [
            'action' => 'delete', 'ids' => [[1]],
        ])->assertJsonValidationErrors('ids.0');
        $this->getJson('/admin/users?per_page=0')->assertJsonValidationErrors('per_page');
        $this->getJson('/admin/roles?per_page=501')->assertJsonValidationErrors('per_page');
    }

    public function test_admin_request_authorization_runs_before_mutations(): void
    {
        $this->signIn([]);
        $this->postJson('/admin/users', [])->assertForbidden();
        $this->postJson('/admin/roles', [])->assertForbidden();
        $this->postJson('/admin/users/bulk-action', ['action' => 'delete', 'ids' => [1]])->assertForbidden();
        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('roles', 0);
    }

    public function test_verification_cannot_reactivate_banned_users_or_verify_a_changed_email(): void
    {
        $user = $this->makeUser();
        $token = Hash::encryptArray([
            'user_id' => $user->id,
            'email' => $user->email,
            'timestamp' => now()->toDateTimeString(),
        ]);
        $user->status = 'banned';
        $user->save();
        $this->get('/admin/email-verification?token=' . urlencode($token))
            ->assertRedirect('http://localhost:8080/admin/login');
        $this->assertGuest();
        $this->assertDatabaseHas('users', ['id' => $user->id, 'status' => 'banned']);

        $user->status = 'inactive';
        $user->email = 'changed@example.test';
        $user->save();
        $this->get('/admin/email-verification?token=' . urlencode($token))
            ->assertRedirect('http://localhost:8080/admin/login');
        $this->assertGuest();
        $this->assertSame(null, User::find($user->id)->email_verified_at);
    }
}
