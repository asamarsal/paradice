<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('player_ratings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->integer('mmr')->default(1000);
            $table->string('rank_tier')->default('bronze');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('player_ratings');
    }
};
