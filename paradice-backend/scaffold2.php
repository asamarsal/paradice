<?php

$modelsPath = __DIR__ . '/app/Models';
$migrationsPath = __DIR__ . '/database/migrations';

$definitions = [
    // Phase 2: Web3 Financials
    'Transaction' => [
        'table' => 'transactions',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->foreignUuid("user_id")->constrained("users")->restrictOnDelete();',
            '$table->string("type");',
            '$table->decimal("amount", 24, 8);',
            '$table->string("token_address");',
            '$table->string("tx_hash")->nullable();',
            '$table->string("status")->default("pending");',
        ]
    ],
    'WithdrawalRequest' => [
        'table' => 'withdrawal_requests',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->foreignUuid("user_id")->constrained("users")->restrictOnDelete();',
            '$table->string("token_address");',
            '$table->decimal("amount", 24, 8);',
            '$table->string("status")->default("pending");',
            '$table->string("tx_hash")->nullable();',
            '$table->timestamp("requested_at")->useCurrent();',
            '$table->timestamp("processed_at")->nullable();',
        ],
        'timestamps' => false
    ],

    // Phase 3: Gameplay & Rooms
    'Room' => [
        'table' => 'rooms',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->string("room_code")->unique();',
            '$table->decimal("entry_fee", 24, 8);',
            '$table->string("status")->default("waiting");',
            '$table->foreignUuid("created_by")->constrained("users");',
        ],
        'timestamps' => false,
        'afterup' => 'Schema::table("rooms", function(Blueprint $table) { $table->timestamp("created_at")->useCurrent(); });'
    ],
    'RoomPlayer' => [
        'table' => 'room_players',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->uuid("room_id"); // FK later',
            '$table->foreignUuid("user_id")->constrained("users")->cascadeOnDelete();',
            '$table->integer("seat_position");',
            '$table->boolean("is_winner")->default(false);',
            '$table->timestamp("joined_at")->useCurrent();',
            '$table->unique(["room_id", "user_id"]);'
        ],
        'timestamps' => false
    ],
    'GameState' => [
        'table' => 'game_states',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->uuid("room_id")->unique(); // FK later',
            '$table->foreignUuid("turn_user_id")->constrained("users");',
            '$table->integer("dice_value")->nullable();',
            '$table->jsonb("state_json")->default("{}");',
            '$table->timestamp("updated_at")->useCurrent();'
        ],
        'timestamps' => false
    ],
    'GameMove' => [
        'table' => 'game_moves',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->uuid("room_id"); // FK later',
            '$table->foreignUuid("user_id")->nullable()->constrained("users")->nullOnDelete();',
            '$table->integer("dice_value")->nullable();',
            '$table->jsonb("move_data")->nullable();',
            '$table->timestamp("created_at")->useCurrent();'
        ],
        'timestamps' => false
    ],
    'TurnTimer' => [
        'table' => 'turn_timers',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->uuid("room_id")->unique(); // FK later',
            '$table->foreignUuid("user_id")->nullable()->constrained("users")->nullOnDelete();',
            '$table->timestamp("turn_expires_at");',
            '$table->boolean("is_expired")->default(false);',
        ],
        'timestamps' => false
    ],
    'DiceRoll' => [
        'table' => 'dice_rolls',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->uuid("room_id")->nullable(); // FK later nullOnDelete',
            '$table->foreignUuid("turn_user_id")->nullable()->constrained("users")->nullOnDelete();',
            '$table->string("server_seed_hash");',
            '$table->string("client_seed");',
            '$table->integer("nonce");',
            '$table->string("result_hash");',
            '$table->integer("dice_value");',
            '$table->timestamp("created_at")->useCurrent();'
        ],
        'timestamps' => false
    ],
    'GameAuditLog' => [
        'table' => 'game_audit_logs',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->uuid("room_id")->nullable(); // nullOnDelete FK later',
            '$table->foreignUuid("user_id")->nullable()->constrained("users")->nullOnDelete();',
            '$table->string("action_type");',
            '$table->jsonb("payload")->nullable();',
            '$table->string("client_signature")->nullable();',
            '$table->timestamp("created_at")->useCurrent();'
        ],
        'timestamps' => false
    ],
    'Spectator' => [
        'table' => 'spectators',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->uuid("room_id"); // cascadeOnDelete FK later',
            '$table->foreignUuid("user_id")->constrained("users")->cascadeOnDelete();',
            '$table->timestamp("joined_at")->useCurrent();',
            '$table->unique(["room_id", "user_id"]);'
        ],
        'timestamps' => false
    ],
];

// Phase 4 & Phase 5 included
$definitions2 = [
    'RoomBet' => [
        'table' => 'room_bets',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->uuid("room_id"); // FK cascade',
            '$table->foreignUuid("user_id")->constrained("users")->cascadeOnDelete();',
            '$table->decimal("amount", 24, 8);',
            '$table->string("token_address");',
            '$table->string("status")->default("locked");',
            '$table->timestamp("created_at")->useCurrent();',
            '$table->unique(["room_id", "user_id"]);'
        ],
        'timestamps' => false
    ],
    'RoomEscrow' => [
        'table' => 'room_escrows',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->uuid("room_id")->unique(); // FK cascade',
            '$table->string("contract_address");',
            '$table->integer("chain_id");',
            '$table->string("token_address");',
            '$table->decimal("total_locked", 24, 8)->default(0);',
            '$table->string("status")->default("pending");',
            '$table->timestamp("created_at")->useCurrent();'
        ],
        'timestamps' => false
    ],
    'Payout' => [
        'table' => 'payouts',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->uuid("room_id")->nullable(); // FK nullOnDelete',
            '$table->foreignUuid("winner_user_id")->nullable()->constrained("users")->nullOnDelete();',
            '$table->decimal("total_pool", 24, 8);',
            '$table->decimal("platform_fee", 24, 8)->default(0);',
            '$table->decimal("winner_amount", 24, 8);',
            '$table->string("tx_hash")->nullable();',
            '$table->timestamp("created_at")->useCurrent();'
        ],
        'timestamps' => false
    ],
    'Background' => [
        'table' => 'backgrounds',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->string("name")->unique();',
            '$table->string("image_url");',
            '$table->string("rarity")->default("common");',
            '$table->boolean("is_default")->default(false);',
            '$table->timestamp("created_at")->useCurrent();'
        ],
        'timestamps' => false
    ],
    'Music' => [
        'table' => 'musics',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->string("name")->unique();',
            '$table->string("audio_url");',
            '$table->string("rarity")->default("common");',
            '$table->boolean("is_default")->default(false);',
            '$table->timestamp("created_at")->useCurrent();'
        ],
        'timestamps' => false
    ],
    'Nft' => [
        'table' => 'nfts',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->string("contract_address");',
            '$table->bigInteger("token_id");',
            '$table->string("token_standard")->default("erc721");',
            '$table->integer("royalty_percentage")->default(0);',
            '$table->timestamp("created_at")->useCurrent();'
        ],
        'timestamps' => false
    ],
    'UserNft' => [
        'table' => 'user_nfts',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->foreignUuid("user_id")->constrained("users")->cascadeOnDelete();',
            '$table->uuid("nft_id"); // FK cascade',
            '$table->string("mint_tx_hash")->nullable();',
            '$table->timestamp("created_at")->useCurrent();'
        ],
        'timestamps' => false
    ],
    'UserCustomItem' => [
        'table' => 'user_custom_items',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->foreignUuid("user_id")->constrained("users")->cascadeOnDelete();',
            '$table->uuid("item_id"); // polymorphic',
            '$table->string("item_type"); // polymorphic',
            '$table->string("source")->default("free");',
            '$table->timestamp("created_at")->useCurrent();'
        ],
        'timestamps' => false
    ],
    'RoomCustomization' => [
        'table' => 'room_customizations',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->uuid("room_id")->unique(); // FK cascade',
            '$table->uuid("background_id")->nullable(); // FK nullOnDelete',
            '$table->uuid("music_id")->nullable(); // FK nullOnDelete',
            '$table->foreignUuid("set_by_user_id")->nullable()->constrained("users")->nullOnDelete();',
            '$table->timestamp("created_at")->useCurrent();'
        ],
        'timestamps' => false
    ],
    'PlayerPenalty' => [
        'table' => 'player_penalties',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->foreignUuid("user_id")->constrained("users")->cascadeOnDelete();',
            '$table->uuid("room_id")->nullable();',
            '$table->string("reason");',
            '$table->decimal("penalty_amount", 24, 8)->default(0);',
            '$table->timestamp("created_at")->useCurrent();'
        ],
        'timestamps' => false
    ],
    'Report' => [
        'table' => 'reports',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->foreignUuid("reported_user_id")->constrained("users")->cascadeOnDelete();',
            '$table->foreignUuid("reported_by")->nullable()->constrained("users")->nullOnDelete();',
            '$table->text("reason");',
            '$table->string("status")->default("pending");',
            '$table->timestamp("created_at")->useCurrent();'
        ],
        'timestamps' => false
    ],
    'BannedUser' => [
        'table' => 'banned_users',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->foreignUuid("user_id")->unique()->constrained("users")->cascadeOnDelete();',
            '$table->text("reason");',
            '$table->timestamp("banned_until")->nullable();',
            '$table->timestamp("created_at")->useCurrent();'
        ],
        'timestamps' => false
    ]
];

$allDefs = array_merge($definitions, $definitions2);

// Read migrations
$files = scandir($migrationsPath);
$migrationMap = [];
foreach ($files as $f) {
    if (str_ends_with($f, '.php')) {
        $parts = explode('_create_', $f);
        if (count($parts) === 2) {
            $tableName = str_replace('_table.php', '', $parts[1]);
            $migrationMap[$tableName] = $migrationsPath . '/' . $f;
        }
    }
}

foreach ($allDefs as $modelName => $def) {
    // Model Generation
    $modelFile = "$modelsPath/$modelName.php";
    $modelContent = "<?php\n\nnamespace App\Models;\n\nuse Illuminate\Database\Eloquent\Factories\HasFactory;\nuse Illuminate\Database\Eloquent\Model;\nuse Illuminate\Database\Eloquent\Concerns\HasUuids;\n\nclass $modelName extends Model\n{\n    use HasFactory, HasUuids;\n    protected \$keyType = 'string';\n    public \$incrementing = false;\n    protected \$guarded = [];\n";
    if (isset($def['timestamps']) && $def['timestamps'] === false) {
        $modelContent .= "    public \$timestamps = false;\n";
    }
    $modelContent .= "}\n";
    file_put_contents($modelFile, $modelContent);

    // Migration Generation
    $tableName = $def['table'];
    if (isset($migrationMap[$tableName])) {
        $migFile = $migrationMap[$tableName];
        
        $fieldsStr = implode("\n            ", $def['fields']);
        if (!isset($def['timestamps']) || $def['timestamps'] !== false) {
            $fieldsStr .= "\n            \$table->timestamps();";
        }

        $afterUpStr = isset($def['afterup']) ? "\n        " . $def['afterup'] : "";

        $migContent = "<?php\n\nuse Illuminate\Database\Migrations\Migration;\nuse Illuminate\Database\Schema\Blueprint;\nuse Illuminate\Support\Facades\Schema;\nuse Illuminate\Support\Facades\DB;\n\nreturn new class extends Migration\n{\n    public function up(): void\n    {\n        Schema::create('$tableName', function (Blueprint \$table) {\n            $fieldsStr\n        });$afterUpStr\n    }\n\n    public function down(): void\n    {\n        Schema::dropIfExists('$tableName');\n    }\n};\n";
        
        file_put_contents($migFile, $migContent);
        echo "Updated $modelName & $tableName\n";
    } else {
        echo "Missing migration for $tableName\n";
    }
}
