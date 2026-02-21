<?php

namespace App\Http\Controllers;

use App\Support\Auth\AuthFlowService;
use App\Support\Auth\GoogleUserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function __construct(
        private readonly AuthFlowService $authFlow,
        private readonly GoogleUserService $googleUserService,
    ) {
    }

    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable $exception) {
            $requestId = (string) Str::uuid();

            Log::error('Google OAuth callback failed', [
                'request_id' => $requestId,
                'error_code' => 'oauth_failed',
                'message' => $exception->getMessage(),
                'exception' => get_class($exception),
            ]);

            return $this->authFlow->redirectWithError('oauth_failed', $requestId);
        }

        $email = $googleUser->getEmail();

        if (! $email) {
            return $this->authFlow->redirectWithError('email_not_available');
        }

        $user = $this->googleUserService->upsert(
            $email,
            $googleUser->getId(),
            $googleUser->getName() ?: $googleUser->getNickname() ?: 'Google User'
        );

        $token = $this->authFlow->issueAuthToken($user);

        return $this->authFlow->redirectWithSuccess()
            ->withCookie($this->authFlow->authCookie($token));
    }

    public function logout(Request $request)
    {
        $this->authFlow->revokeCurrentToken($request);

        return response()->json([
            'message' => 'Logged out',
        ])->withCookie($this->authFlow->forgetAuthCookie());
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
