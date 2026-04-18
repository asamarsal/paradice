<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dice_rolls', function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->uuid("room_id")->nullable(); // FK later nullOnDelete
            $table->foreignUuid("turn_user_id")->nullable()->constrained("users")->nullOnDelete();
            $table->string("server_seed_hash");
            $table->string("client_seed");
            $table->integer("nonce");
            $table->string("result_hash");
            $table->integer("dice_value");
            $table->timestamp("created_at")->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dice_rolls');
    }
};
