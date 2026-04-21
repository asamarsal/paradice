<?php

namespace App\Services;

use App\Events\DiceCommitted;
use App\Events\DiceRevealed;
use App\Events\DiceRolled;
use App\Models\DicePlayerSeed;
use App\Models\DiceRoll;
use App\Models\DiceSession;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CommitRevealDiceService
{
    public function commitRoom(string $roomId): array
    {
        return DB::transaction(function () use ($roomId): array {
            $session = DiceSession::query()
                ->where('room_id', $roomId)
                ->lockForUpdate()
                ->first();

            if ($session && $session->status === 'committed') {
                return [
                    'room_id' => $roomId,
                    'server_seed_hash' => $session->server_seed_hash,
                    'nonce' => (int) $session->nonce,
                    'status' => $session->status,
                    'reused' => true,
                ];
            }

            $serverSeed = $this->generateSeed();
            $serverSeedHash = hash('sha256', $serverSeed);

            if ($session) {
                $session->room_id = $roomId;
                $session->server_seed_encrypted = Crypt::encryptString($serverSeed);
                $session->server_seed_hash = $serverSeedHash;
                $session->nonce = 0;
                $session->status = 'committed';
                $session->revealed_at = null;
                $session->save();
            } else {
                $session = DiceSession::query()->create([
                    'room_id' => $roomId,
                    'server_seed_encrypted' => Crypt::encryptString($serverSeed),
                    'server_seed_hash' => $serverSeedHash,
                    'nonce' => 0,
                    'status' => 'committed',
                    'revealed_at' => null,
                ]);
            }

            event(new DiceCommitted($roomId, $session->server_seed_hash, (int) $session->nonce));

            return [
                'room_id' => $roomId,
                'server_seed_hash' => $session->server_seed_hash,
                'nonce' => (int) $session->nonce,
                'status' => $session->status,
                'reused' => false,
            ];
        });
    }

    public function registerPlayerSeed(string $roomId, string $playerKey, ?string $requestedSeed = null): array
    {
        $session = DiceSession::query()
            ->where('room_id', $roomId)
            ->first();

        if (!$session || $session->status !== 'committed') {
            throw new RuntimeException('Dice room is not committed yet.');
        }

        $playerSeed = $this->normalizeSeed($requestedSeed) ?? $this->generateSeed();

        $record = DicePlayerSeed::query()->updateOrCreate(
            ['room_id' => $roomId, 'player_key' => $playerKey],
            ['player_seed' => $playerSeed]
        );

        return [
            'room_id' => $roomId,
            'player_key' => $playerKey,
            'player_seed' => $record->player_seed,
            'server_seed_hash' => $session->server_seed_hash,
        ];
    }

    public function roll(string $roomId, string $playerKey): array
    {
        return DB::transaction(function () use ($roomId, $playerKey): array {
            $session = DiceSession::query()
                ->where('room_id', $roomId)
                ->lockForUpdate()
                ->first();

            if (!$session || $session->status !== 'committed') {
                throw new RuntimeException('Dice room is not committed yet.');
            }

            $seedRow = DicePlayerSeed::query()
                ->where('room_id', $roomId)
                ->where('player_key', $playerKey)
                ->lockForUpdate()
                ->first();

            if (!$seedRow) {
                $seedRow = DicePlayerSeed::query()->create([
                    'room_id' => $roomId,
                    'player_key' => $playerKey,
                    'player_seed' => $this->generateSeed(),
                ]);
            }

            $serverSeed = Crypt::decryptString($session->server_seed_encrypted);
            $nonce = ((int) $session->nonce) + 1;

            $resultHash = hash('sha256', $serverSeed.$seedRow->player_seed.$nonce);
            $diceValue = $this->hashToDice($resultHash);

            $session->nonce = $nonce;
            $session->save();

            DiceRoll::query()->create([
                'room_id' => $roomId,
                'turn_user_id' => null,
                'server_seed_hash' => $session->server_seed_hash,
                'client_seed' => $seedRow->player_seed,
                'nonce' => $nonce,
                'result_hash' => $resultHash,
                'dice_value' => $diceValue,
            ]);

            event(new DiceRolled(
                $roomId,
                $playerKey,
                $nonce,
                $diceValue,
                $resultHash,
                $session->server_seed_hash
            ));

            return [
                'room_id' => $roomId,
                'player_key' => $playerKey,
                'server_seed_hash' => $session->server_seed_hash,
                'nonce' => $nonce,
                'result_hash' => $resultHash,
                'dice_value' => $diceValue,
            ];
        });
    }

    public function reveal(string $roomId): array
    {
        return DB::transaction(function () use ($roomId): array {
            $session = DiceSession::query()
                ->where('room_id', $roomId)
                ->lockForUpdate()
                ->first();

            if (!$session) {
                throw new RuntimeException('Dice room was not found.');
            }

            $serverSeed = Crypt::decryptString($session->server_seed_encrypted);

            if ($session->status !== 'revealed') {
                $session->status = 'revealed';
                $session->revealed_at = now();
                $session->save();
            }

            event(new DiceRevealed(
                $roomId,
                $serverSeed,
                $session->server_seed_hash,
                (int) $session->nonce
            ));

            return [
                'room_id' => $roomId,
                'server_seed' => $serverSeed,
                'server_seed_hash' => $session->server_seed_hash,
                'final_nonce' => (int) $session->nonce,
                'status' => $session->status,
                'revealed_at' => optional($session->revealed_at)->toISOString(),
            ];
        });
    }

    public function history(string $roomId): array
    {
        $session = DiceSession::query()
            ->where('room_id', $roomId)
            ->first();

        $rolls = DiceRoll::query()
            ->where('room_id', $roomId)
            ->orderBy('nonce')
            ->get([
                'nonce',
                'client_seed',
                'result_hash',
                'dice_value',
                'server_seed_hash',
                'created_at',
            ])
            ->map(static function (DiceRoll $roll): array {
                return [
                    'nonce' => (int) $roll->nonce,
                    'player_seed' => $roll->client_seed,
                    'result_hash' => $roll->result_hash,
                    'dice_value' => (int) $roll->dice_value,
                    'server_seed_hash' => $roll->server_seed_hash,
                    'created_at' => optional($roll->created_at)->toISOString(),
                ];
            })
            ->all();

        return [
            'room_id' => $roomId,
            'status' => $session?->status,
            'nonce' => (int) ($session?->nonce ?? 0),
            'server_seed_hash' => $session?->server_seed_hash,
            'rolls' => $rolls,
        ];
    }

    private function generateSeed(): string
    {
        return bin2hex(random_bytes(32));
    }

    private function normalizeSeed(?string $seed): ?string
    {
        if ($seed === null) {
            return null;
        }

        $trimmed = trim($seed);

        return $trimmed === '' ? null : $trimmed;
    }

    private function hashToDice(string $resultHash): int
    {
        $intValue = hexdec(substr($resultHash, 0, 8));

        return ($intValue % 6) + 1;
    }
}
