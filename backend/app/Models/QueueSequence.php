<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QueueSequence extends Model
{
    protected $fillable = [
        'loket_id',
        'queue_date',
        'last_no',
    ];

    protected function casts(): array
    {
        return [
            'loket_id' => 'integer',
            'queue_date' => 'date',
            'last_no' => 'integer',
        ];
    }

    public function loket(): BelongsTo
    {
        return $this->belongsTo(Loket::class);
    }
}
