<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_bets', function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->uuid("room_id"); // FK cascade
            $table->foreignUuid("user_id")->constrained("users")->cascadeOnDelete();
            $table->decimal("amount", 24, 8);
            $table->string("token_address");
            $table->string("status")->default("locked");
            $table->timestamp("created_at")->useCurrent();
            $table->unique(["room_id", "user_id"]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_bets');
    }
};
