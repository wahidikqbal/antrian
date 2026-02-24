<?php

$frontendOrigins = collect(explode(',', (string) env('FRONTEND_URLS', '')))
    ->map(fn (string $origin) => trim($origin))
    ->filter(fn (string $origin) => $origin !== '')
    ->values()
    ->all();

$fallbackFrontendOrigin = trim((string) env('FRONTEND_URL', 'http://localhost:3000'));
$csrfGuardHeaderName = trim((string) env('CSRF_GUARD_HEADER_NAME', 'X-CSRF-Guard'));

if (empty($frontendOrigins) && $fallbackFrontendOrigin !== '') {
    $frontendOrigins = [$fallbackFrontendOrigin];
}

$allowedHeaders = [
    'Accept',
    'Authorization',
    'Content-Type',
    'Origin',
    'X-Requested-With',
    'X-CSRF-TOKEN',
];

if ($csrfGuardHeaderName !== '' && ! in_array($csrfGuardHeaderName, $allowedHeaders, true)) {
    $allowedHeaders[] = $csrfGuardHeaderName;
}

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $frontendOrigins,
    'allowed_origins_patterns' => [],
    'allowed_headers' => $allowedHeaders,
    'exposed_headers' => [],
    'max_age' => (int) env('CORS_MAX_AGE', 600),
    'supports_credentials' => true,
];
