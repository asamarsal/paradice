<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dice_sessions', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('room_id')->unique();
            $table->text('server_seed_encrypted');
            $table->string('server_seed_hash');
            $table->unsignedBigInteger('nonce')->default(0);
            $table->string('status')->default('committed');
            $table->timestamp('revealed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dice_sessions');
    }
};
