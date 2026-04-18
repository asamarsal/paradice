<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('turn_timers', function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->uuid("room_id")->unique(); // FK later
            $table->foreignUuid("user_id")->nullable()->constrained("users")->nullOnDelete();
            $table->timestamp("turn_expires_at");
            $table->boolean("is_expired")->default(false);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('turn_timers');
    }
};
