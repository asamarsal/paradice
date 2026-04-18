<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('banned_users', function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->foreignUuid("user_id")->unique()->constrained("users")->cascadeOnDelete();
            $table->text("reason");
            $table->timestamp("banned_until")->nullable();
            $table->timestamp("created_at")->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banned_users');
    }
};
