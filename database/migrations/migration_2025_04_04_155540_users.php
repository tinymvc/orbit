<?php

use Spark\Database\Schema\Blueprint;
use Spark\Database\Schema\Schema;

return new class {
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name', 80)->unique()->required();
            $table->string('last_name', 80)->unique()->required();
            $table->string('username', 100)->unique()->required();
            $table->string('email', 60)->unique()->required();
            $table->string('password', 255)->required();
            $table->string('remember_token', 200)->nullable();
            $table->enum('status', ['active', 'inactive', 'banned', 'verified', 'unverified'])->default('active');
            $table->timestamps();
            $table->index('status');
            $table->index(['email', 'username']);
            $table->index(['first_name', 'last_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};