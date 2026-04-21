<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table): void {
            $table->unsignedTinyInteger('max_players')->default(2)->after('entry_fee');
            $table->boolean('is_private')->default(false)->after('max_players');
            $table->string('password_hash')->nullable()->after('is_private');
            $table->timestamp('expires_at')->nullable()->after('created_at');
        });
    }

    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table): void {
            $table->dropColumn(['max_players', 'is_private', 'password_hash', 'expires_at']);
        });
    }
};
