<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('game_sessions', function (Blueprint $table) {
            $table->string('verification_status', 20)->default('pending')->after('status');
            $table->string('verification_reason', 255)->nullable()->after('verification_status');
            $table->timestamp('verified_at')->nullable()->after('finished_at');
        });
    }

    public function down(): void
    {
        Schema::table('game_sessions', function (Blueprint $table) {
            $table->dropColumn([
                'verification_status',
                'verification_reason',
                'verified_at',
            ]);
        });
    }
};

