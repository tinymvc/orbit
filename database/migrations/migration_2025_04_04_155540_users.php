<?php

use Spark\Database\Schema\Blueprint;
use Spark\Database\Schema\Schema;

return new class {
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name', 80)->nullable();
            $table->string('last_name', 80)->nullable();
            $table->string('username', 100)->unique()->required();
            $table->string('email', 60)->unique()->required();
            $table->string('password', 255)->required();
            $table->string('remember_token', 200)->nullable();
            $table->enum('status', ['active', 'inactive', 'suspended', 'banned'])->default('inactive');
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamps();
            $table->index('status');
            $table->index(['email', 'username']);
            $table->index(['first_name', 'last_name']);
        });

        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->required();
            $table->string('slug', 150)->required()->unique();
            $table->json('privileges');
            $table->timestamps();
            $table->index('name');
        });

        Schema::create('roles_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
        });

        Schema::create('reset_password_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('token')->unique();
            $table->timestamp('expires_at');
            $table->boolean('used')->default(false);
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title', 150)->required();
            $table->string('description', 250)->nullable();
            $table->string('slug', 250)->nullable();
            $table->string('type', 50)->required();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('title');
            $table->index('type');
            $table->index(['title', 'type']);
            $table->index(['user_id', 'title']);
            $table->index(['user_id', 'type']);
            $table->index(['user_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('reset_password_links');
        Schema::dropIfExists('roles_users');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('users');
    }
};