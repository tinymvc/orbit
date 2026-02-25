<?php

use Spark\Database\Schema\Blueprint;
use Spark\Database\Schema\Schema;

return new class {
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->required();
            $table->string('slug', 150)->required()->unique();
            $table->json('privileges');
            $table->timestamps();
            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};