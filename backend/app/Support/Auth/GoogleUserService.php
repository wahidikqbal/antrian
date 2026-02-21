<?php

namespace App\Support\Auth;

use App\Models\User;
use Illuminate\Support\Str;

class GoogleUserService
{
    public function upsert(string $email, string $googleId, string $name): User
    {
        $existingUser = User::query()->where('email', $email)->first();
        $role = $this->resolveRoleForEmail($email, $existingUser?->role);

        return User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'google_id' => $googleId,
                'role' => $role,
                'email_verified_at' => now(),
                'password' => bcrypt(Str::random(32)),
            ]
        );
    }

    private function resolveRoleForEmail(string $email, ?string $currentRole): string
    {
        if ($this->isAdminEmail($email)) {
            return User::ROLE_ADMIN;
        }

        // Keep manually assigned admin role unless explicitly changed by command.
        if ($currentRole === User::ROLE_ADMIN) {
            return User::ROLE_ADMIN;
        }

        return User::ROLE_USER;
    }

    private function isAdminEmail(string $email): bool
    {
        $adminEmails = collect(explode(',', (string) env('ADMIN_EMAILS', '')))
            ->map(fn (string $item) => strtolower(trim($item)))
            ->filter()
            ->values();

        return $adminEmails->contains(strtolower($email));
    }
}
