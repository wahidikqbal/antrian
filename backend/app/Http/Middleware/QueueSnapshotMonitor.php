<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class QueueSnapshotMonitor
{
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = $request->header('X-Request-Id') ?: (string) Str::uuid();
        $start = microtime(true);
        $queryCount = 0;
        $sqlTimeMs = 0.0;

        DB::listen(function (QueryExecuted $query) use (&$queryCount, &$sqlTimeMs): void {
            $queryCount++;
            $sqlTimeMs += $query->time;
        });

        /** @var Response $response */
        $response = $next($request);

        $durationMs = (int) round((microtime(true) - $start) * 1000);
        $statusCode = $response->getStatusCode();
        $slowThresholdMs = (int) env('SNAPSHOT_SLOW_THRESHOLD_MS', 500);

        $logContext = [
            'request_id' => $requestId,
            'method' => $request->method(),
            'path' => $request->path(),
            'status_code' => $statusCode,
            'duration_ms' => $durationMs,
            'query_count' => $queryCount,
            'sql_time_ms' => (int) round($sqlTimeMs),
            'loket_slug' => $request->route('loket')?->slug,
            'user_id' => $request->user()?->id,
            'ip_address' => $request->ip(),
        ];

        if ($statusCode >= 500) {
            Log::error('Queue snapshot request failed', $logContext);
        } elseif ($durationMs > $slowThresholdMs) {
            Log::warning('Queue snapshot request slow', $logContext);
        } else {
            Log::info('Queue snapshot request', $logContext);
        }

        $response->headers->set('X-Request-Id', $requestId);
        $response->headers->set('X-Snapshot-Duration-Ms', (string) $durationMs);
        $response->headers->set('X-Snapshot-Query-Count', (string) $queryCount);

        return $response;
    }
}
