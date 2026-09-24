<?php

namespace Tests\Feature;

use App\Models\Notification;
use Tests\DatabaseTestCase;

final class NotificationsTest extends DatabaseTestCase
{
    private function seedNotifications(int $userId, int $count): void
    {
        for ($index = 0; $index < $count; $index++) {
            Notification::insert([
                'user_id' => $userId,
                'title' => "Update $index",
                'type' => 'info',
                'description' => 'Notification content',
                'slug' => '/admin/profile'
            ]);
        }
    }

    public function test_feed_returns_twenty_items_per_page_in_newest_first_order(): void
    {
        $user = $this->signIn();
        $this->seedNotifications($user->id, 45);
        $other = $this->makeUser([], 'other');
        $this->seedNotifications($other->id, 3);
        $cursor = null;
        $ids = [];
        foreach ([20, 20, 5] as $count) {
            $page = $this->getJson('/admin/notifications/feed' . ($cursor ? "?before=$cursor&per_page=100" : '?per_page=100'))
                ->assertOk()->assertJsonCount($count, 'items')->assertJsonPath('unreadCount', 45);
            foreach ($page->json('items') as $item) {
                $this->assertSame($user->id, $item['user_id']);
                $this->assertSame('Notification content', $item['description']);
                $ids[] = $item['id'];
            }
            $cursor = $page->json('nextCursor');
        }
        $this->assertSame(null, $cursor);
        $this->assertSame(range(45, 1), $ids);
        $this->getJson('/admin/notifications/feed?before=1')->assertJsonCount(0, 'items')->assertJsonPath('nextCursor', null);
        $this->get('/admin/notifications')->assertNotFound();
    }

    public function test_exact_page_and_empty_feed_have_no_next_cursor(): void
    {
        $user = $this->signIn();
        $this->getJson('/admin/notifications/feed')->assertJson(['items' => [], 'nextCursor' => null, 'unreadCount' => 0]);
        $this->seedNotifications($user->id, 20);
        $this->getJson('/admin/notifications/feed')->assertJsonCount(20, 'items')->assertJsonPath('nextCursor', null);
    }

    public function test_new_items_and_deletions_do_not_shift_older_pages(): void
    {
        $user = $this->signIn();
        $this->seedNotifications($user->id, 41);
        $first = $this->getJson('/admin/notifications/feed')->assertOk();
        $cursor = $first->json('nextCursor');
        $this->postJson('/admin/notifications', ['action' => 'remove', 'id' => 41])->assertOk();
        $this->seedNotifications($user->id, 1);
        $page = $this->getJson("/admin/notifications/feed?before=$cursor")->assertOk()->assertJsonCount(20, 'items');
        $this->assertSame(range(21, 2), array_column($page->json('items'), 'id'));
        $cursor = $page->json('nextCursor');
        $this->getJson("/admin/notifications/feed?before=$cursor")->assertJsonCount(1, 'items')->assertJsonPath('items.0.id', 1);
        $this->getJson('/admin/notifications/feed')->assertJsonPath('items.0.id', 42);
    }

    public function test_read_actions_are_idempotent_and_update_global_badge_counts(): void
    {
        $user = $this->signIn();
        $this->seedNotifications($user->id, 25);
        $read = $this->postJson('/admin/notifications', ['action' => 'mark-read', 'id' => 1])
            ->assertOk()->assertJsonPath('unreadCount', 24);
        $this->assertDatabaseHas('notifications', ['id' => 1, 'read_at' => $read->json('readAt')]);
        Notification::where('id', 1)->update(['read_at' => '2026-01-01 12:00:00']);
        $this->postJson('/admin/notifications', ['action' => 'mark-read', 'id' => 1])
            ->assertOk()->assertJsonPath('unreadCount', 24)->assertJsonPath('readAt', '2026-01-01 12:00:00');
        $this->postJson('/admin/notifications', ['action' => 'mark-all-read'])->assertOk()->assertJsonPath('unreadCount', 0);
        $this->get('/admin')->assertJsonPath('props.notifications.unreadCount', 0);
        $this->assertDatabaseHas('notifications', ['id' => 1, 'read_at' => '2026-01-01 12:00:00']);
        $this->postJson('/admin/notifications', ['action' => 'clear'])->assertOk()->assertJsonPath('unreadCount', 0);
        $this->getJson('/admin/notifications/feed')->assertJsonCount(0, 'items')->assertJsonPath('nextCursor', null);
    }

    public function test_actions_cannot_read_or_delete_another_users_notifications(): void
    {
        $user = $this->signIn();
        $this->seedNotifications($user->id, 1);
        $other = $this->makeUser([], 'other');
        $this->seedNotifications($other->id, 1);
        foreach (['mark-read', 'remove'] as $action) {
            $this->postJson('/admin/notifications', ['action' => $action, 'id' => 2])->assertNotFound();
            $this->postJson('/admin/notifications', ['action' => $action, 'id' => 999])->assertNotFound();
        }
        $this->postJson('/admin/notifications', ['action' => 'mark-all-read'])->assertOk();
        $this->postJson('/admin/notifications', ['action' => 'clear'])->assertOk();
        $this->assertDatabaseCount('notifications', 1);
        $this->assertDatabaseHas('notifications', ['id' => 2, 'user_id' => $other->id, 'read_at' => null]);
    }

    public function test_invalid_actions_ids_and_cursors_return_validation_errors(): void
    {
        $this->signIn();
        foreach (['', 'unknown'] as $action) {
            $this->postJson('/admin/notifications', ['action' => $action])->assertUnprocessable()->assertJsonValidationErrors('action');
        }
        foreach ([null, 0, -1, 1.5, '1e2', [], 'abc'] as $id) {
            $this->postJson('/admin/notifications', ['action' => 'mark-read', 'id' => $id])
                ->assertUnprocessable()->assertJsonValidationErrors('id');
        }
        foreach (['0', '-1', '1.5', '1e2', 'abc', '1&before[]=2'] as $cursor) {
            $this->getJson('/admin/notifications/feed?before=' . $cursor)->assertUnprocessable()->assertJsonValidationErrors('before');
        }
    }

    public function test_authentication_and_csrf_are_required_for_actions(): void
    {
        $this->getJson('/admin/notifications/feed')->assertRedirect('http://localhost:8080/admin/login');
        $this->postJson('/admin/notifications', ['action' => 'clear'])->assertStatus(419);
        $this->signIn();
        $this->postJson('/admin/notifications', ['action' => 'clear'], ['X-CSRF-TOKEN' => 'invalid'])->assertStatus(419);
    }
}
