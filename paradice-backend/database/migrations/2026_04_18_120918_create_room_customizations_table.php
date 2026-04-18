<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_customizations', function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->uuid("room_id")->unique(); // FK cascade
            $table->uuid("background_id")->nullable(); // FK nullOnDelete
            $table->uuid("music_id")->nullable(); // FK nullOnDelete
            $table->foreignUuid("set_by_user_id")->nullable()->constrained("users")->nullOnDelete();
            $table->timestamp("created_at")->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_customizations');
    }
};
