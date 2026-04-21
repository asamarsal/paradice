<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DiceRevealed implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public string $roomId,
        public string $serverSeed,
        public string $serverSeedHash,
        public int $finalNonce
    ) {
    }

    public function broadcastOn(): array
    {
        return [new Channel('room.'.$this->roomId)];
    }

    public function broadcastAs(): string
    {
        return 'dice.revealed';
    }

    public function broadcastWith(): array
    {
        return [
            'room_id' => $this->roomId,
            'server_seed' => $this->serverSeed,
            'server_seed_hash' => $this->serverSeedHash,
            'final_nonce' => $this->finalNonce,
        ];
    }
}
