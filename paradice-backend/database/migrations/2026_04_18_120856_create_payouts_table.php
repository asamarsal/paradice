<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payouts', function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->uuid("room_id")->nullable(); // FK nullOnDelete
            $table->foreignUuid("winner_user_id")->nullable()->constrained("users")->nullOnDelete();
            $table->decimal("total_pool", 24, 8);
            $table->decimal("platform_fee", 24, 8)->default(0);
            $table->decimal("winner_amount", 24, 8);
            $table->string("tx_hash")->nullable();
            $table->timestamp("created_at")->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payouts');
    }
};
