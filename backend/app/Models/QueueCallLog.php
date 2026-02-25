<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QueueCallLog extends Model
{
    protected $fillable = [
        'queue_ticket_id',
        'loket_id',
        'called_by',
        'called_at',
        'voice_text',
    ];

    protected function casts(): array
    {
        return [
            'queue_ticket_id' => 'integer',
            'loket_id' => 'integer',
            'called_by' => 'integer',
            'called_at' => 'datetime',
        ];
    }

    public function queueTicket(): BelongsTo
    {
        return $this->belongsTo(QueueTicket::class);
    }

    public function loket(): BelongsTo
    {
        return $this->belongsTo(Loket::class);
    }

    public function caller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'called_by');
    }
}
