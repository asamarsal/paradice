<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('withdrawal_requests', function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->foreignUuid("user_id")->constrained("users")->restrictOnDelete();
            $table->string("token_address");
            $table->decimal("amount", 24, 8);
            $table->string("status")->default("pending");
            $table->string("tx_hash")->nullable();
            $table->timestamp("requested_at")->useCurrent();
            $table->timestamp("processed_at")->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('withdrawal_requests');
    }
};
