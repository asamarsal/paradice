<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameSession;
use App\Models\Room;
use App\Models\User;
use App\Services\GameSettlementVerifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use RuntimeException;

class GameSessionController extends Controller
{
    public function __construct(
        private readonly GameSettlementVerifier $settlementVerifier
    ) {
    }

    public function show(string $sessionRef): JsonResponse
    {
        $session = GameSession::query()
            ->where('session_ref', $sessionRef)
            ->first();

        if (!$session) {
            return response()->json([
                'message' => 'Game session tidak ditemukan.',
            ], 404);
        }

        return response()->json($this->payload($session));
    }

    public function start(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_ref' => ['required', 'string', 'max:120'],
            'room_code' => ['nullable', 'string', 'max:32'],
            'creator_wallet_address' => ['required', 'string', 'max:100'],
            'mode' => ['required', 'string', 'in:2player,4player'],
            'stake_usd' => ['required', 'numeric', 'min:0.1'],
            'stake_units' => ['required', 'integer', 'min:1'],
            'max_players' => ['required', 'integer', 'in:2,4'],
            'chain_id' => ['required', 'string', 'max:80'],
            'module_address' => ['required', 'string', 'max:120'],
            'create_game_tx_hash' => ['required', 'string', 'max:255'],
        ]);

        $room = null;
        if (!empty($validated['room_code'])) {
            $room = Room::query()
                ->where('room_code', Str::upper(trim((string) $validated['room_code'])))
                ->first();
        }

        $creatorWallet = trim((string) $validated['creator_wallet_address']);
        $creatorUser = User::query()
            ->where('wallet_address', $creatorWallet)
            ->first();

        $session = GameSession::query()->updateOrCreate(
            ['session_ref' => trim((string) $validated['session_ref'])],
            [
                'room_id' => $room?->id,
                'creator_user_id' => $creatorUser?->id,
                'creator_wallet_address' => $creatorWallet,
                'status' => 'started',
                'verification_status' => 'pending',
                'verification_reason' => null,
                'mode' => (string) $validated['mode'],
                'stake_usd' => (float) $validated['stake_usd'],
                'stake_units' => (int) $validated['stake_units'],
                'max_players' => (int) $validated['max_players'],
                'chain_id' => trim((string) $validated['chain_id']),
                'module_address' => trim((string) $validated['module_address']),
                'create_game_tx_hash' => trim((string) $validated['create_game_tx_hash']),
                'winner_wallet_address' => null,
                'settle_tx_hash' => null,
                'finished_at' => null,
                'verified_at' => null,
            ]
        );

        return response()->json($this->payload($session), 201);
    }

    public function finish(Request $request, string $sessionRef): JsonResponse
    {
        $validated = $request->validate([
            'settle_tx_hash' => ['required', 'string', 'max:255'],
        ]);

        $session = GameSession::query()
            ->where('session_ref', $sessionRef)
            ->first();

        if (!$session) {
            return response()->json([
                'message' => 'Game session tidak ditemukan.',
            ], 404);
        }

        try {
            $verified = $this->settlementVerifier->verify(
                $session,
                trim((string) $validated['settle_tx_hash'])
            );
        } catch (RuntimeException $exception) {
            $session->verification_status = 'failed';
            $session->verification_reason = $exception->getMessage();
            $session->save();

            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        $session->status = 'finished';
        $session->verification_status = 'verified';
        $session->verification_reason = null;
        $session->winner_wallet_address = $verified['winner_wallet_address'];
        $session->settle_tx_hash = $verified['settle_tx_hash'];
        $session->finished_at = now();
        $session->verified_at = now();
        $session->save();

        return response()->json($this->payload($session));
    }

    private function payload(GameSession $session): array
    {
        return [
            'session_ref' => $session->session_ref,
            'room_id' => $session->room_id,
            'creator_wallet_address' => $session->creator_wallet_address,
            'status' => $session->status,
            'verification_status' => $session->verification_status,
            'verification_reason' => $session->verification_reason,
            'mode' => $session->mode,
            'stake_usd' => (float) $session->stake_usd,
            'stake_units' => (int) $session->stake_units,
            'max_players' => (int) $session->max_players,
            'chain_id' => $session->chain_id,
            'module_address' => $session->module_address,
            'create_game_tx_hash' => $session->create_game_tx_hash,
            'winner_wallet_address' => $session->winner_wallet_address,
            'settle_tx_hash' => $session->settle_tx_hash,
            'finished_at' => optional($session->finished_at)?->toISOString(),
            'verified_at' => optional($session->verified_at)?->toISOString(),
            'created_at' => optional($session->created_at)?->toISOString(),
        ];
    }
}
