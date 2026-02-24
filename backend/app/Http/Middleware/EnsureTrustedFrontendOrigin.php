<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTrustedFrontendOrigin
{
    public function handle(Request $request, Closure $next): Response
    {
        $trustedOrigins = $this->trustedOrigins();

        if ($trustedOrigins === []) {
            return response()->json([
                'message' => 'Trusted frontend origins are not configured.',
            ], 500);
        }

        $origin = $request->headers->get('Origin');
        if (is_string($origin) && $origin !== '') {
            return $this->isTrusted($origin, $trustedOrigins)
                ? $next($request)
                : $this->forbiddenResponse();
        }

        $referer = $request->headers->get('Referer');
        if (is_string($referer) && $referer !== '') {
            return $this->isTrusted($referer, $trustedOrigins)
                ? $next($request)
                : $this->forbiddenResponse();
        }

        return $this->forbiddenResponse();
    }

    /**
     * @return list<string>
     */
    private function trustedOrigins(): array
    {
        $trustedFromEnv = collect(explode(',', (string) env('TRUSTED_FRONTEND_ORIGINS', '')))
            ->map(fn (string $value) => $this->normalizeOrigin($value))
            ->filter()
            ->values()
            ->all();

        if ($trustedFromEnv !== []) {
            return $trustedFromEnv;
        }

        $fallbackOrigins = collect(explode(',', (string) env('FRONTEND_URLS', '')))
            ->map(fn (string $value) => $this->normalizeOrigin($value))
            ->filter()
            ->values()
            ->all();

        if ($fallbackOrigins !== []) {
            return $fallbackOrigins;
        }

        $singleOrigin = $this->normalizeOrigin((string) env('FRONTEND_URL', 'http://localhost:3000'));

        return $singleOrigin ? [$singleOrigin] : [];
    }

    private function normalizeOrigin(string $value): ?string
    {
        $value = trim($value);
        if ($value === '') {
            return null;
        }

        $parts = parse_url($value);
        if (! is_array($parts)) {
            return null;
        }

        $scheme = isset($parts['scheme']) ? strtolower($parts['scheme']) : null;
        $host = isset($parts['host']) ? strtolower($parts['host']) : null;
        $port = isset($parts['port']) ? (int) $parts['port'] : null;

        if (! $scheme || ! $host) {
            return null;
        }

        $origin = $scheme . '://' . $host;
        if ($port !== null) {
            $origin .= ':' . $port;
        }

        return $origin;
    }

    /**
     * @param  list<string>  $trustedOrigins
     */
    private function isTrusted(string $headerValue, array $trustedOrigins): bool
    {
        $normalized = $this->normalizeOrigin($headerValue);
        if (! $normalized) {
            return false;
        }

        return in_array($normalized, $trustedOrigins, true);
    }

    private function forbiddenResponse(): Response
    {
        return response()->json([
            'message' => 'Request origin is not trusted.',
        ], 403);
    }
}
