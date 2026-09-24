<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Tests\DatabaseTestCase;

final class AdminTest extends DatabaseTestCase
{
    public function test_users_and_roles_can_be_created_updated_and_deleted(): void
    {
        $this->signIn();
        $this->post('/admin/roles', ['name' => 'Editor', 'slug' => 'editor', 'privileges' => ['posts.browse']])->assertStatus(302);
        $role = Role::where('slug', 'editor')->first();
        $this->assertSame(['posts.browse'], $role->privileges->all());
        $data = [
            'first_name' => 'Jane',
            'last_name' => 'Editor',
            'username' => 'jane',
            'email' => 'jane@example.test',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'roles' => [$role->id]
        ];
        $this->post('/admin/users', $data)->assertStatus(302);
        $user = User::where('username', 'jane')->first();
        $this->assertTrue($user->password('Password123!'));
        $this->assertTrue($user->can('posts.browse'));
        $this->assertFalse($user->can('posts.delete'));
        $this->get('/admin/users?search=Jane%20Editor&role=' . $role->id)->assertOk()->assertJsonPath('props.users.total', 1);
        $this->get('/admin/roles?search=Editor')->assertOk()->assertJsonPath('props.roles.total', 1);
        $this->put('/admin/users/' . $user->id, [...$data, 'first_name' => 'Janet', 'password' => '', 'password_confirmation' => ''])
            ->assertStatus(303);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'first_name' => 'Janet']);
        $this->assertTrue(User::find($user->id)->password('Password123!'));
        $this->put('/admin/roles/' . $role->id, ['name' => 'Author', 'slug' => 'editor', 'privileges' => ['posts.create']])->assertStatus(303);
        $this->assertDatabaseHas('roles', ['id' => $role->id, 'name' => 'Author']);
        $this->post('/admin/users/bulk-action', ['action' => 'active', 'ids' => [$user->id]])->assertStatus(302);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'status' => 'active']);
        $this->delete('/admin/users/' . $user->id)->assertStatus(303);
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
        $this->delete('/admin/roles/' . $role->id)->assertStatus(303);
        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }

    public function test_profile_changes_and_password_hashing(): void
    {
        $user = $this->signIn();
        $this->post('/admin/profile', [
            'action' => 'general',
            'first_name' => 'Updated',
            'last_name' => 'Name',
            'username' => 'updated',
            'email' => 'updated@example.test'
        ])->assertStatus(302);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'username' => 'updated']);
        $this->post('/admin/profile', [
            'action' => 'password',
            'current_password' => 'Password123!',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!'
        ])->assertStatus(302);
        $this->assertTrue(User::find($user->id)->password('NewPassword123!'));
    }
}
