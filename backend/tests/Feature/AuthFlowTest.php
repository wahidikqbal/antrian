<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;
use Laravel\Socialite\Facades\Socialite;

uses(RefreshDatabase::class);

it('authenticates /api/me for authenticated user', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $response = $this->getJson('/api/me');

    $response
        ->assertOk()
        ->assertJson([
            'id' => $user->id,
            'email' => $user->email,
        ]);
});

it('logs out and revokes token from bearer token', function () {
    $user = User::factory()->create();
    $plainTextToken = $user->createToken('auth-token')->plainTextToken;
    $token = PersonalAccessToken::findToken($plainTextToken);

    expect($token)->not->toBeNull();

    $response = $this
        ->withHeader('Authorization', 'Bearer ' . $plainTextToken)
        ->postJson('/api/logout');

    $response
        ->assertOk()
        ->assertJson(['message' => 'Logged out'])
        ->assertCookieExpired('auth_token');

    expect(PersonalAccessToken::query()->find($token->id))->toBeNull();
});

it('redirects with structured error and request id when oauth callback fails', function () {
    Socialite::shouldReceive('driver')
        ->once()
        ->with('google')
        ->andReturnSelf();

    Socialite::shouldReceive('user')
        ->once()
        ->andThrow(new RuntimeException('oauth fail'));

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect();

    $redirectUrl = (string) $response->headers->get('Location');

    expect($redirectUrl)->toContain('/auth/callback?');
    expect($redirectUrl)->toContain('error=oauth_failed');
    expect($redirectUrl)->toContain('request_id=');
});
