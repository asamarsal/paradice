<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dice_player_seeds', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('room_id');
            $table->string('player_key');
            $table->string('player_seed');
            $table->timestamps();

            $table->unique(['room_id', 'player_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dice_player_seeds');
    }
};
