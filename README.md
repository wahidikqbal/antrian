# API Auth SaaS (Laravel + Next.js)

Monorepo autentikasi berbasis Google OAuth untuk kebutuhan SaaS.

- `backend/`: Laravel 12 + Socialite + Sanctum
- `frontend/`: Next.js 16 (App Router)

## Fitur Utama

- Login Google OAuth
- Session/token via cookie httpOnly (`auth_token`)
- Halaman private `/dashboard`
- Role `user` dan `admin`
- Endpoint admin terproteksi middleware role
- Audit log autentikasi (retensi 5 data terbaru)
- Halaman status/error: `401`, `403`, `404`, `500`

## Alur Login

1. User buka `/login` di frontend.
2. Frontend arahkan ke backend `GET /auth/google/redirect`.
3. Google callback ke backend `GET /auth/google/callback`.
4. Backend:
   - upsert user,
   - terbitkan token Sanctum,
   - simpan token ke cookie `auth_token`,
   - redirect ke frontend `/auth/callback?login=success`.
5. Frontend callback memvalidasi status login lalu redirect ke `/dashboard`.

## Route Ringkas

### Frontend
- `/` homepage
- `/login` halaman login
- `/auth/callback` halaman transit setelah OAuth
- `/dashboard` halaman private
- `/401`, `/403`, `/500`, serta `not-found` untuk 404

### Backend
- `GET /auth/google/redirect`
- `GET /auth/google/callback`
- `GET /api/me` (`auth:sanctum`)
- `GET /api/me/activity` (`auth:sanctum`, max 5 data)
- `GET /api/admin/overview` (`auth:sanctum`, `role:admin`)
- `POST /api/logout`

## Quick Start

### 1) Backend
```bash
cd backend
composer install
php artisan key:generate
php artisan migrate
php artisan optimize:clear
php artisan serve
```

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Penting

### Backend (`backend/.env`)
```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

AUTH_COOKIE_NAME=auth_token
AUTH_TOKEN_TTL_MINUTES=10080
AUTH_COOKIE_DOMAIN=
AUTH_COOKIE_SAME_SITE=lax
AUTH_COOKIE_SECURE=false
SANCTUM_EXPIRATION=10080

ADMIN_EMAILS=admin1@domain.com,admin2@domain.com
```

### Frontend (`frontend/.env`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Validasi Lokal

### Backend test
```bash
cd backend
vendor/bin/pest --filter AuthFlowTest
```

### Frontend lint
```bash
cd frontend
npm run lint
```

## Catatan Produksi

- Gunakan `APP_ENV=production` dan `APP_DEBUG=false`.
- Jalankan backend/frontend di HTTPS.
- Set `AUTH_COOKIE_SECURE=true`.
- Isi `AUTH_COOKIE_DOMAIN` sesuai domain produksi.
- Gunakan secret OAuth yang aman dan lakukan rotasi jika pernah terekspos.
- Batasi CORS hanya untuk origin frontend produksi.

## Dokumentasi Detail

- Backend: `backend/README.md`
- Frontend: `frontend/README.md`
