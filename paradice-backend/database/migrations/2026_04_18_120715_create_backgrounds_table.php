<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('backgrounds', function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->string("name")->unique();
            $table->string("image_url");
            $table->string("rarity")->default("common");
            $table->boolean("is_default")->default(false);
            $table->timestamp("created_at")->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('backgrounds');
    }
};
