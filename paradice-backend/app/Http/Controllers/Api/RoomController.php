<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\RoomPlayer;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RoomController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $visibility = $request->query('visibility', 'all');

        $query = Room::query()->where('status', 'waiting');

        if ($visibility === 'public') {
            $query->where('is_private', false);
        } elseif ($visibility === 'private') {
            $query->where('is_private', true);
        }

        $rooms = $query
            ->orderByDesc('created_at')
            ->limit(30)
            ->get();

        $roomIds = $rooms->pluck('id')->all();
        $counts = [];

        if (!empty($roomIds)) {
            $counts = RoomPlayer::query()
                ->select('room_id', DB::raw('COUNT(*) as player_count'))
                ->whereIn('room_id', $roomIds)
                ->groupBy('room_id')
                ->pluck('player_count', 'room_id')
                ->all();
        }

        $payload = $rooms->map(function (Room $room) use ($counts): array {
            return [
                'room_code' => $room->room_code,
                'entry_fee' => (float) $room->entry_fee,
                'max_players' => (int) $room->max_players,
                'is_private' => (bool) $room->is_private,
                'status' => $room->status,
                'player_count' => (int) ($counts[$room->id] ?? 0),
                'expires_at' => optional($room->expires_at)?->toISOString(),
                'created_at' => optional($room->created_at)?->toISOString(),
            ];
        })->values();

        return response()->json([
            'rooms' => $payload,
        ]);
    }

    public function create(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'wallet_address' => ['required', 'string', 'max:100'],
            'username' => ['nullable', 'string', 'max:50'],
            'entry_fee' => ['required', 'numeric', 'min:0.1'],
            'max_players' => ['required', 'integer', 'in:2,4'],
            'is_private' => ['nullable', 'boolean'],
            'password' => ['nullable', 'string', 'min:4', 'max:64'],
        ]);

        $isPrivate = (bool) ($validated['is_private'] ?? false);
        $plainPassword = isset($validated['password']) ? trim((string) $validated['password']) : '';

        if ($isPrivate && $plainPassword === '') {
            return response()->json([
                'message' => 'Password wajib diisi untuk room private.',
            ], 422);
        }

        if (!$isPrivate) {
            $plainPassword = '';
        }

        $user = $this->resolveOrCreateUser(
            $validated['wallet_address'],
            $validated['username'] ?? null
        );

        $room = DB::transaction(function () use ($validated, $isPrivate, $plainPassword, $user): Room {
            $room = Room::query()->create([
                'room_code' => $this->generateUniqueRoomCode(),
                'entry_fee' => $validated['entry_fee'],
                'max_players' => (int) $validated['max_players'],
                'is_private' => $isPrivate,
                'password_hash' => $plainPassword !== '' ? Hash::make($plainPassword) : null,
                'status' => 'waiting',
                'created_by' => $user->id,
                'expires_at' => now()->addMinutes(15),
            ]);

            RoomPlayer::query()->create([
                'room_id' => $room->id,
                'user_id' => $user->id,
                'seat_position' => 1,
                'is_winner' => false,
            ]);

            return $room;
        });

        return response()->json($this->roomDetailPayload($room->room_code), 201);
    }

    public function show(string $roomCode): JsonResponse
    {
        $room = Room::query()->where('room_code', $roomCode)->first();

        if (!$room) {
            return response()->json([
                'message' => 'Room tidak ditemukan.',
            ], 404);
        }

        return response()->json($this->roomDetailPayload($roomCode));
    }

    public function join(Request $request, string $roomCode): JsonResponse
    {
        $validated = $request->validate([
            'wallet_address' => ['required', 'string', 'max:100'],
            'username' => ['nullable', 'string', 'max:50'],
            'password' => ['nullable', 'string', 'max:64'],
        ]);

        $user = $this->resolveOrCreateUser(
            $validated['wallet_address'],
            $validated['username'] ?? null
        );

        $plainPassword = isset($validated['password']) ? trim((string) $validated['password']) : '';

        $joinError = null;

        DB::transaction(function () use ($roomCode, $user, $plainPassword, &$joinError): void {
            $room = Room::query()
                ->where('room_code', $roomCode)
                ->lockForUpdate()
                ->first();

            if (!$room) {
                $joinError = ['message' => 'Room tidak ditemukan.', 'status' => 404];
                return;
            }

            if ($room->status !== 'waiting') {
                $joinError = ['message' => 'Room sudah tidak bisa di-join.', 'status' => 422];
                return;
            }

            if ($room->expires_at && now()->greaterThan($room->expires_at)) {
                $room->status = 'expired';
                $room->save();
                $joinError = ['message' => 'Room sudah expired.', 'status' => 422];
                return;
            }

            if ($room->is_private && (!is_string($room->password_hash) || !Hash::check($plainPassword, $room->password_hash))) {
                $joinError = ['message' => 'Password room salah.', 'status' => 422];
                return;
            }

            $existing = RoomPlayer::query()
                ->where('room_id', $room->id)
                ->where('user_id', $user->id)
                ->first();

            if ($existing) {
                return;
            }

            // PostgreSQL does not allow FOR UPDATE on aggregate queries.
            // Locking the room row above is already enough to serialize joins.
            $currentCount = RoomPlayer::query()
                ->where('room_id', $room->id)
                ->count();

            if ($currentCount >= (int) $room->max_players) {
                $room->status = 'full';
                $room->save();
                $joinError = ['message' => 'Room sudah penuh.', 'status' => 422];
                return;
            }

            RoomPlayer::query()->create([
                'room_id' => $room->id,
                'user_id' => $user->id,
                'seat_position' => $currentCount + 1,
                'is_winner' => false,
            ]);

            $nextCount = $currentCount + 1;
            if ($nextCount >= (int) $room->max_players) {
                $room->status = 'full';
                $room->save();
            }
        });

        if ($joinError) {
            return response()->json([
                'message' => $joinError['message'],
            ], $joinError['status']);
        }

        return response()->json($this->roomDetailPayload($roomCode));
    }

    private function resolveOrCreateUser(string $walletAddress, ?string $username): User
    {
        $normalizedWallet = trim($walletAddress);
        $fallbackName = $username && trim($username) !== ''
            ? trim($username)
            : 'Player-'.Str::upper(Str::random(5));

        $user = User::query()->where('wallet_address', $normalizedWallet)->first();

        if ($user) {
            if (($username && trim($username) !== '') && $user->username !== trim($username)) {
                $user->username = trim($username);
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

    private function generateUniqueRoomCode(): string
    {
        do {
            $code = 'PARA-'.Str::upper(Str::random(4));
        } while (Room::query()->where('room_code', $code)->exists());

        return $code;
    }

    private function roomDetailPayload(string $roomCode): array
    {
        $room = Room::query()
            ->where('room_code', $roomCode)
            ->firstOrFail();

        $players = DB::table('room_players')
            ->join('users', 'room_players.user_id', '=', 'users.id')
            ->where('room_players.room_id', $room->id)
            ->orderBy('room_players.seat_position')
            ->get([
                'users.id as user_id',
                'users.username',
                'users.wallet_address',
                'room_players.seat_position',
                'room_players.joined_at',
            ])
            ->map(static function ($row): array {
                return [
                    'user_id' => $row->user_id,
                    'username' => $row->username,
                    'wallet_address' => $row->wallet_address,
                    'seat_position' => (int) $row->seat_position,
                    'joined_at' => $row->joined_at,
                ];
            })
            ->values()
            ->all();

        return [
            'room_code' => $room->room_code,
            'entry_fee' => (float) $room->entry_fee,
            'max_players' => (int) $room->max_players,
            'is_private' => (bool) $room->is_private,
            'creator_wallet_address' => (string) (User::query()->find($room->created_by)?->wallet_address ?? ''),
            'status' => $room->status,
            'expires_at' => optional($room->expires_at)?->toISOString(),
            'created_at' => optional($room->created_at)?->toISOString(),
            'players' => $players,
        ];
    }
}
