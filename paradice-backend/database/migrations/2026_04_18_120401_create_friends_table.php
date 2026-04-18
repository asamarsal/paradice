<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('friends', function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->foreignUuid("user_id_1")->constrained("users")->cascadeOnDelete();
            $table->foreignUuid("user_id_2")->constrained("users")->cascadeOnDelete();
            $table->string("status")->default("pending");
            $table->unique(["user_id_1", "user_id_2"]);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('friends');
    }
};
