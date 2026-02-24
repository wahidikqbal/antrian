<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireCsrfGuardHeader
{
    public function handle(Request $request, Closure $next): Response
    {
        $headerName = (string) env('CSRF_GUARD_HEADER_NAME', 'X-CSRF-Guard');
        $expectedValue = (string) env('CSRF_GUARD_HEADER_VALUE', '1');
        $actualValue = (string) $request->headers->get($headerName, '');

        if ($actualValue !== $expectedValue) {
            return response()->json([
                'message' => 'CSRF guard header missing or invalid.',
            ], 419);
        }

        return $next($request);
    }
}
