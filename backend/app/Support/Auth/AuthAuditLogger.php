<?php

namespace App\Support\Auth;

use App\Models\AuthAuditLog;
use Illuminate\Http\Request;

class AuthAuditLogger
{
    /**
     * @param  array<string, mixed>  $context
     */
    public function log(
        string $event,
        Request $request,
        ?int $userId = null,
        ?string $email = null,
        ?string $requestId = null,
        array $context = []
    ): void {
        AuthAuditLog::create([
            'event' => $event,
            'user_id' => $userId,
            'email' => $email,
            'request_id' => $requestId,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'context' => $context !== [] ? $context : null,
            'created_at' => now(),
        ]);

        $this->pruneToLatestFive($userId, $email);
    }

    private function pruneToLatestFive(?int $userId, ?string $email): void
    {
        $query = AuthAuditLog::query();

        if ($userId !== null) {
            $query->where('user_id', $userId);
        } elseif ($email !== null) {
            $query->whereNull('user_id')->where('email', $email);
        } else {
            $query->whereNull('user_id')->whereNull('email');
        }

        $orderedIds = (clone $query)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->pluck('id');

        $idsToDelete = $orderedIds->slice(5); // Keep only latest 5 records

        if ($idsToDelete->isNotEmpty()) {
            AuthAuditLog::query()->whereIn('id', $idsToDelete)->delete();
        }
    }
}
