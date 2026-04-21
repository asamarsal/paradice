<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DiceRolled implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public string $roomId,
        public string $playerKey,
        public int $nonce,
        public int $diceValue,
        public string $resultHash,
        public string $serverSeedHash
    ) {
    }

    public function broadcastOn(): array
    {
        return [new Channel('room.'.$this->roomId)];
    }

    public function broadcastAs(): string
    {
        return 'dice.rolled';
    }

    public function broadcastWith(): array
    {
        return [
            'room_id' => $this->roomId,
            'player_key' => $this->playerKey,
            'nonce' => $this->nonce,
            'dice_value' => $this->diceValue,
            'result_hash' => $this->resultHash,
            'server_seed_hash' => $this->serverSeedHash,
        ];
    }
}
