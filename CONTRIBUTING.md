# Contributing Guide

## Development Setup

1. Backend:
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan optimize:clear
php artisan serve
```

2. Frontend:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Quality Gates (Wajib Lulus)

Backend:
```bash
cd backend
vendor/bin/pest --filter AuthFlowTest
php artisan auth:config-check
```

Frontend:
```bash
cd frontend
npm run lint
```

## Security Rules

- Jangan commit file `.env`.
- Jangan memasukkan secret real ke README, issue, atau PR.
- Perubahan auth flow wajib menyertakan pengujian regresi login/logout/session/admin.
- Endpoint auth baru harus punya middleware proteksi yang konsisten (`auth:sanctum`, origin check, CSRF, throttle sesuai kebutuhan).

## Commit & PR Notes

- Gunakan pesan commit ringkas dan spesifik.
- Tulis ringkasan perubahan, risiko, dan langkah verifikasi pada PR.
- Jika mengubah konfigurasi env, update `.env.example` + dokumentasi terkait.
