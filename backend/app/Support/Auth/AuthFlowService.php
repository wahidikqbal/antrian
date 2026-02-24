<?php

namespace App\Support\Auth;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Cookie;

class AuthFlowService
{
    public function redirectWithError(string $errorCode, ?string $requestId = null): RedirectResponse
    {
        $query = ['error' => $errorCode];

        if ($requestId) {
            $query['request_id'] = $requestId;
        }

        return redirect($this->frontendUrl() . '/auth/callback?' . http_build_query($query));
    }

    public function redirectWithSuccess(): RedirectResponse
    {
        return redirect($this->frontendUrl() . '/auth/callback?login=success');
    }

    public function issueAuthToken(User $user): string
    {
        $ttlMinutes = $this->authTokenTtlMinutes();

        // Keep only one active token per account for this web login flow.
        $user->tokens()->where('name', 'auth-token')->delete();

        return $user
            ->createToken('auth-token', ['auth:read', 'auth:write'], now()->addMinutes($ttlMinutes))
            ->plainTextToken;
    }

    public function revokeCurrentToken(Request $request): void
    {
        if ($request->user()?->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
            return;
        }

        $plainTextToken = $request->bearerToken();

        if ($plainTextToken) {
            PersonalAccessToken::findToken($plainTextToken)?->delete();
        }
    }

    public function authCookie(string $token): Cookie
    {
        $options = $this->cookieOptions();

        return cookie(
            $options['name'],
            $token,
            $this->authTokenTtlMinutes(),
            '/',
            $options['domain'],
            $options['secure'],
            true,
            false,
            $options['same_site']
        );
    }

    public function forgetAuthCookie(): Cookie
    {
        $options = $this->cookieOptions();

        return cookie()->forget($options['name'], '/', $options['domain']);
    }

    private function frontendUrl(): string
    {
        return rtrim((string) env('FRONTEND_URL', 'http://localhost:3000'), '/');
    }

    private function authTokenTtlMinutes(): int
    {
        return max((int) env('AUTH_TOKEN_TTL_MINUTES', 60 * 24 * 7), 1);
    }

    /**
     * @return array{name: string, domain: string|null, same_site: string, secure: bool}
     */
    private function cookieOptions(): array
    {
        $sameSite = strtolower((string) env('AUTH_COOKIE_SAME_SITE', 'lax'));
        $sameSite = in_array($sameSite, ['lax', 'strict', 'none'], true) ? $sameSite : 'lax';

        $secureCookie = filter_var(
            env('AUTH_COOKIE_SECURE', app()->environment('production')),
            FILTER_VALIDATE_BOOL
        );

        if ($sameSite === 'none') {
            $secureCookie = true;
        }

        return [
            'name' => (string) env('AUTH_COOKIE_NAME', 'auth_token'),
            'domain' => env('AUTH_COOKIE_DOMAIN') ?: null,
            'same_site' => $sameSite,
            'secure' => $secureCookie,
        ];
    }
}
