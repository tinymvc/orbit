<?php

namespace Tests\Feature;

use Tests\DatabaseTestCase;

final class AuthenticationTest extends DatabaseTestCase
{
    public function test_guests_are_redirected_from_every_admin_area(): void
    {
        foreach (['/admin', '/admin/users', '/admin/roles', '/admin/posts', '/admin/categories', '/admin/profile'] as $uri) {
            $this->get($uri)->assertRedirect('http://localhost:8080/admin/login');
        }
    }

    public function test_login_page_has_the_initial_inertia_payload(): void
    {
        $this->get('/admin/login')->assertOk()->assertSee('script data-page="app"')->assertSee('auth/login');
    }

    public function test_login_logout_and_guest_middleware(): void
    {
        $user = $this->makeUser();
        $this->withSession(['csrf_token' => 'test-csrf'])->withHeaders(['X-CSRF-TOKEN' => 'test-csrf']);
        $this->post('/admin/login', ['user' => $user->username, 'password' => 'Password123!'])
            ->assertRedirect('http://localhost:8080/admin');
        $this->assertAuthenticated();
        $this->get('/admin/login')->assertRedirect('http://localhost:8080/admin');
        $this->post('/admin/logout')->assertRedirect('http://localhost:8080/admin/login');
        $this->assertGuest();
    }

    public function test_invalid_credentials_and_inactive_accounts_stay_logged_out(): void
    {
        $user = $this->makeUser();
        $this->withSession(['csrf_token' => 'test-csrf'])->withHeaders(['X-CSRF-TOKEN' => 'test-csrf']);
        $this->post('/admin/login', ['user' => $user->username, 'password' => 'Incorrect123!']);
        $this->assertGuest();
        $user->status = 'inactive';
        $user->save();
        $this->post('/admin/login', ['user' => $user->username, 'password' => 'Password123!']);
        $this->assertGuest();
    }

    public function test_csrf_and_validation_are_enforced(): void
    {
        $this->postJson('/admin/login', [])->assertStatus(419);
        $this->withSession(['csrf_token' => 'test-csrf']);
        $this->postJson('/admin/login', [], ['X-CSRF-TOKEN' => 'test-csrf'])
            ->assertUnprocessable()->assertJsonValidationErrors(['user', 'password']);
    }

    public function test_password_reset_tokens_expire_and_can_only_be_used_once(): void
    {
        $user = $this->makeUser();
        $this->withSession(['csrf_token' => 'test-csrf'])->withHeaders(['X-CSRF-TOKEN' => 'test-csrf']);
        \App\Models\ResetPasswordLink::create(['user_id' => $user->id, 'token' => 'valid-token',
            'expires_at' => now()->addMinutes(60)]);
        $data = ['token' => \Spark\Facades\Hash::encrypt('valid-token'),
            'password' => 'NewPassword123!', 'password_confirmation' => 'NewPassword123!'];
        $this->post('/admin/reset-password', $data)->assertRedirect('http://localhost:8080/admin/login');
        $this->assertTrue(\App\Models\User::find($user->id)->password('NewPassword123!'));
        $this->assertDatabaseHas('reset_password_links', ['token' => 'valid-token', 'used' => 1]);
        $this->post('/admin/reset-password', [...$data, 'password' => 'AnotherPassword123!', 'password_confirmation' => 'AnotherPassword123!']);
        $this->assertTrue(\App\Models\User::find($user->id)->password('NewPassword123!'));
        \App\Models\ResetPasswordLink::create(['user_id' => $user->id, 'token' => 'expired-token',
            'expires_at' => now()->subMinutes(60)]);
        $this->post('/admin/reset-password', [...$data, 'token' => \Spark\Facades\Hash::encrypt('expired-token')]);
        $this->assertDatabaseHas('reset_password_links', ['token' => 'expired-token', 'used' => 0]);
    }

    public function test_email_verification_uses_the_current_hash_and_auth_apis(): void
    {
        $user = $this->makeUser();
        $token = \Spark\Facades\Hash::encryptArray(['user_id' => $user->id, 'timestamp' => now()->toDateTimeString()]);
        $this->get('/admin/email-verification?token=' . urlencode($token))->assertRedirect('http://localhost:8080/admin');
        $this->assertAuthenticated();
        $this->assertTrue(\App\Models\User::find($user->id)->hasVerifiedEmail());
    }

    public function test_shared_user_and_dashboard_props_use_current_inertia_contract(): void
    {
        $user = $this->signIn();
        $response = $this->get('/admin')->assertOk()->assertJsonPath('component', 'admin/dashboard')
            ->assertJsonPath('props.auth.user.id', $user->id)
            ->assertJsonPath('props.notifications.unreadCount', 0);
        $this->assertFalse(array_key_exists('password', $response->json('props.auth.user')));
        $this->assertFalse(array_key_exists('notificationItems', $response->json('props')));
        $this->assertCount(4, $response->json('props.dashboard.stats'));
        $this->assertCount(7, $response->json('props.dashboard.charts'));
    }
}
