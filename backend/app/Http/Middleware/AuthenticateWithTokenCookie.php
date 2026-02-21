<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateWithTokenCookie
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->bearerToken()) {
            $cookieName = (string) env('AUTH_COOKIE_NAME', 'auth_token');
            $tokenFromCookie = (string) $request->cookie($cookieName, '');

            if ($tokenFromCookie !== '') {
                $request->headers->set('Authorization', 'Bearer ' . $tokenFromCookie);
            }
        }

        return $next($request);
    }
}
