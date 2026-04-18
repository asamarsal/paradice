<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->string("room_code")->unique();
            $table->decimal("entry_fee", 24, 8);
            $table->string("status")->default("waiting");
            $table->foreignUuid("created_by")->constrained("users");
        });
        Schema::table("rooms", function(Blueprint $table) { $table->timestamp("created_at")->useCurrent(); });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
