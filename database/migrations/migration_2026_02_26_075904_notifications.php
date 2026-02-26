<?php

use Spark\Database\Schema\Blueprint;
use Spark\Database\Schema\Schema;

return new class {
    public function up(): void
    {
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
    }
};