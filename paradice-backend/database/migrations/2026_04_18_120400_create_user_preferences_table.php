<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->foreignUuid("user_id")->unique()->constrained("users")->cascadeOnDelete();
            $table->uuid("active_background_id")->nullable(); // Foreign added later
            $table->uuid("active_music_id")->nullable(); // Foreign added later
            $table->boolean("sound_enabled")->default(true);
            $table->integer("music_volume")->default(80);
            $table->integer("sfx_volume")->default(90);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};
