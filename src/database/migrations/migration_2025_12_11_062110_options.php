<?php

use Spark\Database\Schema\Blueprint;
use Spark\Database\Schema\Schema;

return new class {
    public function up(): void
    {
        Schema::create('options', function (Blueprint $table) {
            $table->id();
            $table->string('option_key', 200)->unique();
            $table->text('option_value')->nullable();
            $table->boolean('autoload')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('options');
    }
};