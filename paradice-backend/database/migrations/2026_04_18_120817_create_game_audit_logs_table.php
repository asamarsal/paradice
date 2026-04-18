<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_audit_logs', function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->uuid("room_id")->nullable(); // nullOnDelete FK later
            $table->foreignUuid("user_id")->nullable()->constrained("users")->nullOnDelete();
            $table->string("action_type");
            $table->jsonb("payload")->nullable();
            $table->string("client_signature")->nullable();
            $table->timestamp("created_at")->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_audit_logs');
    }
};
