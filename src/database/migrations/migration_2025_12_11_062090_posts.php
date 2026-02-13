<?php

use Spark\Database\Schema\Blueprint;
use Spark\Database\Schema\Schema;

return new class {
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 250);
            $table->string('slug', 250)->unique();
            $table->string('image', 255)->nullable();
            $table->string('excerpt', 255)->nullable();
            $table->text('content')->nullable();
            $table->string('type', 100)->default('post');
            $table->string('status', 50)->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->index('title');
            $table->index(['title', 'type']);
            $table->index('published_at');
            $table->index('excerpt');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};