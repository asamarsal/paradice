<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DiceCommitted implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public string $roomId,
        public string $serverSeedHash,
        public int $nonce
    ) {
    }

    public function broadcastOn(): array
    {
        return [new Channel('room.'.$this->roomId)];
    }

    public function broadcastAs(): string
    {
        return 'dice.commit';
    }

    public function broadcastWith(): array
    {
        return [
            'room_id' => $this->roomId,
            'server_seed_hash' => $this->serverSeedHash,
            'nonce' => $this->nonce,
        ];
    }
}
