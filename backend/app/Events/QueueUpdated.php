<?php

namespace App\Events;

use App\Models\QueueTicket;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class QueueUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public QueueTicket $ticket,
        public string $action,
        public ?string $voiceText = null,
    ) {
    }

    public function broadcastOn(): array
    {
        $slug = $this->ticket->loket?->slug;

        return [new Channel('loket.'.$slug)];
    }

    public function broadcastAs(): string
    {
        return 'queue.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'action' => $this->action,
            'loket_slug' => $this->ticket->loket?->slug,
            'ticket_id' => $this->ticket->id,
            'ticket_no' => $this->ticket->ticket_no,
            'status' => $this->ticket->status,
            'called_at' => $this->ticket->called_at,
            'voice_text' => $this->voiceText,
            'updated_at' => $this->ticket->updated_at,
        ];
    }
}
