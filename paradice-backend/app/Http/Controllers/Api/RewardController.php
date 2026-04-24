<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Nft;
use App\Models\User;
use App\Models\UserNft;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RewardController extends Controller
{
    public function claimWinnerNft(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'wallet_address' => ['required', 'string', 'max:100'],
            'username' => ['nullable', 'string', 'max:50'],
            'session_ref' => ['required', 'string', 'max:120'],
            'mode' => ['required', 'string', 'in:2player,4player'],
            'stake_usd' => ['required', 'numeric', 'min:0.1'],
            'player_won' => ['required', 'boolean'],
        ]);

        if (!$validated['player_won']) {
            return response()->json([
                'message' => 'NFT winner hanya bisa diklaim oleh pemenang.',
            ], 422);
        }

        $walletAddress = trim((string) $validated['wallet_address']);
        $sessionRef = trim((string) $validated['session_ref']);
        $mode = (string) $validated['mode'];
        $stakeUsd = (float) $validated['stake_usd'];
        $claimRef = "winner:{$sessionRef}";
        $contractAddress = 'paradice_ludo_winner';
        $tokenId = $mode === '4player' ? 2004 : 2002;
        $username = isset($validated['username']) ? trim((string) $validated['username']) : null;

        $user = $this->resolveOrCreateUser($walletAddress, $username);

        $result = DB::transaction(function () use (
            $claimRef,
            $contractAddress,
            $mode,
            $stakeUsd,
            $tokenId,
            $user,
            $sessionRef
        ): array {
            $existingClaim = UserNft::query()
                ->where('mint_tx_hash', $claimRef)
                ->first();

            if ($existingClaim) {
                if ($existingClaim->user_id !== $user->id) {
                    return [
                        'ok' => false,
                        'status' => 409,
                        'message' => 'NFT untuk sesi ini sudah diklaim wallet lain.',
                    ];
                }

                $claimedNft = Nft::query()->find($existingClaim->nft_id);

                return [
                    'ok' => true,
                    'already_claimed' => true,
                    'mint_tx_hash' => $existingClaim->mint_tx_hash,
                    'nft' => $claimedNft,
                    'claimed_at' => optional($existingClaim->created_at)?->toISOString(),
                ];
            }

            $nft = Nft::query()->firstOrCreate(
                [
                    'contract_address' => $contractAddress,
                    'token_id' => $tokenId,
                    'token_standard' => 'erc721',
                ],
                [
                    'royalty_percentage' => 0,
                ]
            );

            $mintTxHash = '0xmint' . substr(sha1("{$sessionRef}:{$user->id}"), 0, 24);

            $userNft = UserNft::query()->create([
                'user_id' => $user->id,
                'nft_id' => $nft->id,
                'mint_tx_hash' => $claimRef,
            ]);

            return [
                'ok' => true,
                'already_claimed' => false,
                'mint_tx_hash' => $mintTxHash,
                'nft' => $nft,
                'claimed_at' => optional($userNft->created_at)?->toISOString(),
                'meta' => [
                    'mode' => $mode,
                    'stake_usd' => $stakeUsd,
                ],
            ];
        });

        if (!$result['ok']) {
            return response()->json([
                'message' => $result['message'],
            ], $result['status']);
        }

        return response()->json([
            'message' => $result['already_claimed']
                ? 'Winner NFT sudah pernah diklaim untuk sesi ini.'
                : 'Winner NFT berhasil diklaim.',
            'claimed' => true,
            'already_claimed' => $result['already_claimed'],
            'claim_ref' => $claimRef,
            'wallet_address' => $walletAddress,
            'mint_tx_hash' => $result['mint_tx_hash'],
            'claimed_at' => $result['claimed_at'],
            'nft' => [
                'id' => $result['nft']?->id,
                'contract_address' => $result['nft']?->contract_address,
                'token_id' => $result['nft']?->token_id,
                'token_standard' => $result['nft']?->token_standard,
            ],
        ]);
    }

    private function resolveOrCreateUser(string $walletAddress, ?string $username): User
    {
        $normalizedWallet = trim($walletAddress);
        $fallbackName = $username && $username !== ''
            ? $username
            : 'Player-' . Str::upper(Str::random(5));

        $user = User::query()->where('wallet_address', $normalizedWallet)->first();

        if ($user) {
            if ($username && $username !== '' && $user->username !== $username) {
                $user->username = $username;
                $user->save();
            }

            return $user;
        }

        return User::query()->create([
            'wallet_address' => $normalizedWallet,
            'username' => $fallbackName,
            'kyc_status' => 'none',
            'risk_score' => 0,
        ]);
    }
}
