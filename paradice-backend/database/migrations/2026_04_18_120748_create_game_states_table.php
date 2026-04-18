<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_states', function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->uuid("room_id")->unique(); // FK later
            $table->foreignUuid("turn_user_id")->constrained("users");
            $table->integer("dice_value")->nullable();
            $table->jsonb("state_json")->default("{}");
            $table->timestamp("updated_at")->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_states');
    }
};
