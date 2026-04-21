<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CommitRevealDiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class DiceRealtimeController extends Controller
{
    public function __construct(
        private readonly CommitRevealDiceService $diceService
    ) {
    }

    public function commit(string $roomId): JsonResponse
    {
        $payload = $this->diceService->commitRoom($roomId);

        return response()->json($payload);
    }

    public function history(string $roomId): JsonResponse
    {
        $payload = $this->diceService->history($roomId);

        return response()->json($payload);
    }

    public function registerPlayerSeed(Request $request, string $roomId): JsonResponse
    {
        $validated = $request->validate([
            'player_key' => ['required', 'string', 'max:64'],
            'player_seed' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $payload = $this->diceService->registerPlayerSeed(
                $roomId,
                $validated['player_key'],
                $validated['player_seed'] ?? null
            );
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json($payload);
    }

    public function roll(Request $request, string $roomId): JsonResponse
    {
        $validated = $request->validate([
            'player_key' => ['required', 'string', 'max:64'],
        ]);

        try {
            $payload = $this->diceService->roll($roomId, $validated['player_key']);
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json($payload);
    }

    public function reveal(string $roomId): JsonResponse
    {
        try {
            $payload = $this->diceService->reveal($roomId);
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json($payload);
    }
}
