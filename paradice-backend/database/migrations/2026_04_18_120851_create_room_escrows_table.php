<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_escrows', function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->uuid("room_id")->unique(); // FK cascade
            $table->string("contract_address");
            $table->integer("chain_id");
            $table->string("token_address");
            $table->decimal("total_locked", 24, 8)->default(0);
            $table->string("status")->default("pending");
            $table->timestamp("created_at")->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_escrows');
    }
};
