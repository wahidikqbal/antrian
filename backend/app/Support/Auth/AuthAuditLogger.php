<?php

namespace App\Support\Auth;

use App\Models\AuthAuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

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

        $this->monitorOAuthFailureSpike($event, $request);
        $this->pruneToLatestFive($userId, $email);
    }

    private function monitorOAuthFailureSpike(string $event, Request $request): void
    {
        if ($event !== 'oauth_failed') {
            return;
        }

        $windowSeconds = max((int) env('ALERT_OAUTH_FAILED_WINDOW_SECONDS', 300), 60);
        $threshold = max((int) env('ALERT_OAUTH_FAILED_THRESHOLD', 5), 1);
        $cooldownSeconds = max((int) env('ALERT_OAUTH_FAILED_COOLDOWN_SECONDS', 120), 30);

        $counterKey = 'monitor:oauth_failed:global_count';
        $alertLockKey = 'monitor:oauth_failed:alert_lock';

        if (! Cache::has($counterKey)) {
            Cache::put($counterKey, 0, now()->addSeconds($windowSeconds));
        }

        $count = (int) Cache::increment($counterKey);

        if ($count < $threshold) {
            return;
        }

        if (! Cache::add($alertLockKey, true, now()->addSeconds($cooldownSeconds))) {
            return;
        }

        Log::critical('OAuth failure spike detected', [
            'event' => $event,
            'count_in_window' => $count,
            'window_seconds' => $windowSeconds,
            'threshold' => $threshold,
            'cooldown_seconds' => $cooldownSeconds,
            'path' => $request->path(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
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
