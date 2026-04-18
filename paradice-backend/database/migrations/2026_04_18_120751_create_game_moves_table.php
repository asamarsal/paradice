<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_moves', function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->uuid("room_id"); // FK later
            $table->foreignUuid("user_id")->nullable()->constrained("users")->nullOnDelete();
            $table->integer("dice_value")->nullable();
            $table->jsonb("move_data")->nullable();
            $table->timestamp("created_at")->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_moves');
    }
};
