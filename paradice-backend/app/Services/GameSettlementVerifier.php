<?php

namespace App\Services;

use App\Models\GameSession;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GameSettlementVerifier
{
    public function verify(GameSession $session, string $settleTxHash): array
    {
        $restUrl = $this->resolveRestUrl();
        $normalizedHash = $this->normalizeTxHash($settleTxHash);

        $txPayload = $this->fetchTxPayload($restUrl, $normalizedHash);
        $txResponse = $txPayload['tx_response'] ?? null;
        if (!is_array($txResponse)) {
            throw new RuntimeException('Format tx response dari chain tidak valid.');
        }

        $code = (int) ($txResponse['code'] ?? 1);
        if ($code !== 0) {
            throw new RuntimeException('Tx settlement gagal di chain.');
        }

        $executedFunction = $this->extractExecutedFunctionName($txPayload);
        if ($executedFunction !== null && $executedFunction !== 'move_pawn') {
            throw new RuntimeException('Tx settlement bukan eksekusi move_pawn.');
        }

        $gameOwnerAddress = trim((string) $session->creator_wallet_address);
        if ($gameOwnerAddress === '') {
            throw new RuntimeException('Creator wallet address tidak tersedia di session.');
        }

        $gameState = $this->fetchGameState($restUrl, $gameOwnerAddress);
        $winnerAddress = trim((string) ($gameState['winner'] ?? ''));
        if ($winnerAddress === '' || $winnerAddress === '0x0' || $winnerAddress === '0x0000000000000000000000000000000000000000') {
            throw new RuntimeException('Winner pada resource game belum final.');
        }

        $status = (int) ($gameState['status'] ?? 0);
        if ($status !== 2) {
            throw new RuntimeException('Status game on-chain belum ENDED.');
        }

        return [
            'winner_wallet_address' => $winnerAddress,
            'settle_tx_hash' => $normalizedHash,
            'status' => $status,
        ];
    }

    private function resolveRestUrl(): string
    {
        $restUrl = trim((string) config('services.initia.rest_url'));
        if ($restUrl === '') {
            throw new RuntimeException('INITIA_REST_URL belum dikonfigurasi di backend.');
        }

        return rtrim($restUrl, '/');
    }

    private function normalizeTxHash(string $txHash): string
    {
        $trimmed = trim($txHash);
        if ($trimmed === '') {
            throw new RuntimeException('settle_tx_hash wajib diisi.');
        }

        if (str_starts_with($trimmed, '0x') || str_starts_with($trimmed, '0X')) {
            return strtoupper(substr($trimmed, 2));
        }

        return strtoupper($trimmed);
    }

    private function fetchTxPayload(string $restUrl, string $txHash): array
    {
        $endpoint = "{$restUrl}/cosmos/tx/v1beta1/txs/{$txHash}";
        $response = Http::timeout(20)->acceptJson()->get($endpoint);
        if ($response->successful()) {
            /** @var array<string, mixed> */
            return $response->json();
        }

        throw new RuntimeException('Gagal mengambil tx receipt dari chain.');
    }

    private function extractExecutedFunctionName(array $txPayload): ?string
    {
        $messages = $txPayload['tx']['body']['messages'] ?? null;
        if (!is_array($messages) || count($messages) === 0) {
            return null;
        }

        $first = $messages[0];
        if (!is_array($first)) {
            return null;
        }

        $type = (string) ($first['@type'] ?? '');
        if ($type !== '/initia.move.v1.MsgExecute') {
            return null;
        }

        $candidate = $first['function_name'] ?? $first['functionName'] ?? null;
        if (!is_string($candidate)) {
            return null;
        }

        return trim($candidate);
    }

    private function fetchGameState(string $restUrl, string $ownerAddress): array
    {
        $candidates = [
            "{$restUrl}/initia/move/v1/accounts/{$ownerAddress}/resources",
            "{$restUrl}/move/v1/accounts/{$ownerAddress}/resources",
        ];

        foreach ($candidates as $endpoint) {
            $response = Http::timeout(20)->acceptJson()->get($endpoint);
            if (!$response->successful()) {
                continue;
            }

            $payload = $response->json();
            if (!is_array($payload)) {
                continue;
            }

            $resource = $this->findGameResource($payload);
            if ($resource !== null) {
                return $resource;
            }
        }

        throw new RuntimeException('Resource game_core::Game tidak ditemukan pada chain.');
    }

    private function findGameResource(array $payload): ?array
    {
        $resources = $payload['resources'] ?? $payload['data']['resources'] ?? null;
        if (!is_array($resources)) {
            return null;
        }

        foreach ($resources as $resource) {
            if (!is_array($resource)) {
                continue;
            }

            $type = (string) ($resource['type'] ?? $resource['struct_tag'] ?? '');
            if ($type === '' || !str_contains($type, '::game_core::Game')) {
                continue;
            }

            $data = $resource['data'] ?? null;
            if (is_array($data)) {
                return $data;
            }

            if (is_array($resource['value'] ?? null)) {
                return $resource['value'];
            }

            return $resource;
        }

        return null;
    }
}

