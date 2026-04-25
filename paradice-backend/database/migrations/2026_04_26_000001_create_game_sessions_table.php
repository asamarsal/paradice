<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('session_ref', 120)->unique();
            $table->foreignUuid('room_id')->nullable()->constrained('rooms')->nullOnDelete();
            $table->foreignUuid('creator_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('creator_wallet_address', 100);
            $table->string('status', 20)->default('started');
            $table->string('mode', 20);
            $table->decimal('stake_usd', 24, 8);
            $table->unsignedBigInteger('stake_units');
            $table->unsignedTinyInteger('max_players');
            $table->string('chain_id', 80);
            $table->string('module_address', 120);
            $table->string('create_game_tx_hash', 255);
            $table->string('winner_wallet_address', 100)->nullable();
            $table->string('settle_tx_hash', 255)->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_sessions');
    }
};
