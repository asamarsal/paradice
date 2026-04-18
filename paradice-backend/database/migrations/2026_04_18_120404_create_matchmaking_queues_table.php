<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matchmaking_queues', function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->foreignUuid("user_id")->unique()->constrained("users")->cascadeOnDelete();
            $table->decimal("entry_fee", 24, 8);
            $table->string("mode")->default("casual");
            $table->string("status")->default("queued");
            $table->integer("mmr_min")->default(0);
            $table->integer("mmr_max")->default(9999);
            $table->uuid("matched_room_id")->nullable(); // FK later
            $table->timestamp("joined_at")->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matchmaking_queues');
    }
};
