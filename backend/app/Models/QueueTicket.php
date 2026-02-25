<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QueueTicket extends Model
{
    public const STATUS_WAITING = 'waiting';
    public const STATUS_SERVING = 'serving';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELED = 'canceled';
    public const STATUS_SKIPPED = 'skipped';

    protected $fillable = [
        'loket_id',
        'ticket_no',
        'queue_date',
        'sequence_no',
        'queue_number',
        'status',
        'user_id',
        'served_by',
        'called_by',
        'called_count',
        'called_at',
        'completed_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'loket_id' => 'integer',
            'ticket_no' => 'string',
            'queue_date' => 'date',
            'sequence_no' => 'integer',
            'queue_number' => 'integer',
            'status' => 'string',
            'user_id' => 'integer',
            'served_by' => 'integer',
            'called_by' => 'integer',
            'called_count' => 'integer',
            'called_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function loket(): BelongsTo
    {
        return $this->belongsTo(Loket::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function servedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'served_by');
    }

    public function calledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'called_by');
    }
}
