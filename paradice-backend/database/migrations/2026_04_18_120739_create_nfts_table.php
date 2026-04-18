<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nfts', function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->string("contract_address");
            $table->bigInteger("token_id");
            $table->string("token_standard")->default("erc721");
            $table->integer("royalty_percentage")->default(0);
            $table->timestamp("created_at")->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nfts');
    }
};
