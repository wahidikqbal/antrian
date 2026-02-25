<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Loket extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'code',
        'room_name',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function admins(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'loket_admins')
            ->withTimestamps();
    }

    public function queueTickets(): HasMany
    {
        return $this->hasMany(QueueTicket::class);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
