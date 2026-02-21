<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('auth:role {email} {role}', function (string $email, string $role) {
    $normalizedRole = strtolower(trim($role));

    if (! in_array($normalizedRole, [User::ROLE_USER, User::ROLE_ADMIN], true)) {
        $this->error('Role tidak valid. Gunakan: user atau admin');
        return self::FAILURE;
    }

    $user = User::query()->where('email', $email)->first();

    if (! $user) {
        $this->error("User dengan email {$email} tidak ditemukan.");
        return self::FAILURE;
    }

    $user->update(['role' => $normalizedRole]);

    $this->info("Role {$email} berhasil diubah menjadi {$normalizedRole}.");
    return self::SUCCESS;
})->purpose('Set role user berdasarkan email (user/admin)');
