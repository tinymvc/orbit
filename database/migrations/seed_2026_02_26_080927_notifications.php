<?php

use App\Models\Notification;

return new class {
    public function up(): void
    {
        Notification::insert([
            [
                'user_id' => 1,
                'title' => 'New order',
                'slug' => '/admin/orders/123',
                'description' => 'You have received a new order.',
                'type' => 'order',
                'created_at' => now()->subDays(rand(1, 10)),
            ],
            [
                'user_id' => 1,
                'title' => 'New user registration',
                'slug' => '/admin/users/456',
                'description' => 'A new user has registered.',
                'type' => 'user',
                'created_at' => now()->subDays(rand(1, 10)),
            ],
            [
                'user_id' => 1,
                'title' => 'System update',
                'slug' => '/admin/system/update',
                'description' => 'The system has been updated successfully.',
                'type' => 'system',
                'created_at' => now()->subDays(rand(1, 10)),
            ],
            [
                'user_id' => 1,
                'title' => 'Password change',
                'slug' => '/admin/profile/security',
                'description' => 'Your password has been changed successfully.',
                'type' => 'security',
                'created_at' => now()->subDays(rand(1, 10)),
            ],
            [
                'user_id' => 1,
                'title' => 'New comment',
                'slug' => '/admin/comments/789',
                'description' => 'You have received a new comment on your post.',
                'type' => 'comment',
                'created_at' => now()->subDays(rand(1, 10)),
            ],
        ]);
    }

    public function down(): void
    {
        Notification::delete('1=1');
    }
};