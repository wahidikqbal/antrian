<?php

namespace App\Support\Auth;

use App\Models\User;
use Illuminate\Support\Str;

class GoogleUserService
{
    public function upsert(string $email, string $googleId, string $name): User
    {
        return User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'google_id' => $googleId,
                'email_verified_at' => now(),
                'password' => bcrypt(Str::random(32)),
            ]
        );
    }
}
