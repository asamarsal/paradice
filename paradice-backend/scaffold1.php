<?php

$modelsPath = __DIR__ . '/app/Models';
$migrationsPath = __DIR__ . '/database/migrations';

$definitions = [
    // Phase 1 Auth/Social remaining
    'UserPreference' => [
        'table' => 'user_preferences',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->foreignUuid("user_id")->unique()->constrained("users")->cascadeOnDelete();',
            '$table->uuid("active_background_id")->nullable(); // Foreign added later',
            '$table->uuid("active_music_id")->nullable(); // Foreign added later',
            '$table->boolean("sound_enabled")->default(true);',
            '$table->integer("music_volume")->default(80);',
            '$table->integer("sfx_volume")->default(90);',
        ]
    ],
    'Friend' => [
        'table' => 'friends',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->foreignUuid("user_id_1")->constrained("users")->cascadeOnDelete();',
            '$table->foreignUuid("user_id_2")->constrained("users")->cascadeOnDelete();',
            '$table->string("status")->default("pending");',
            '$table->unique(["user_id_1", "user_id_2"]);',
        ],
        'afterup' => 'DB::statement("ALTER TABLE friends ADD CONSTRAINT check_user_order CHECK (user_id_1 < user_id_2)");'
    ],
    'ChatMessage' => [
        'table' => 'chat_messages',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->uuid("room_id"); // FK later',
            '$table->foreignUuid("user_id")->nullable()->constrained("users")->nullOnDelete();',
            '$table->text("message");',
        ]
    ],
    'Leaderboard' => [
        'table' => 'leaderboards',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->foreignUuid("user_id")->constrained("users")->cascadeOnDelete();',
            '$table->integer("rank");',
            '$table->decimal("score", 24, 8)->default(0);',
            '$table->string("period");',
            '$table->unique(["user_id", "period"]);'
        ]
    ],
    'MatchmakingQueue' => [
        'table' => 'matchmaking_queues',
        'fields' => [
            '$table->uuid("id")->primary();',
            '$table->foreignUuid("user_id")->unique()->constrained("users")->cascadeOnDelete();',
            '$table->decimal("entry_fee", 24, 8);',
            '$table->string("mode")->default("casual");',
            '$table->string("status")->default("queued");',
            '$table->integer("mmr_min")->default(0);',
            '$table->integer("mmr_max")->default(9999);',
            '$table->uuid("matched_room_id")->nullable(); // FK later',
            '$table->timestamp("joined_at")->useCurrent();'
        ],
        'timestamps' => false
    ],
];

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

foreach ($definitions as $modelName => $def) {
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
