# Changelog

Semua perubahan penting pada project ini dicatat di file ini.

Format mengacu pada prinsip [Keep a Changelog](https://keepachangelog.com/), dengan penyesuaian ringkas untuk kebutuhan belajar dan pengembangan.

## [Unreleased]

### Added
- Placeholder untuk perubahan berikutnya.

## [v0.4.0] - 2026-02-21

### Added
- Endpoint sesi:
  - `GET /api/auth/session`
  - `POST /api/auth/refresh` (sliding session)
- Auto refresh sesi saat user aktif di dashboard.
- Endpoint internal frontend untuk invalidasi cache sesi (`/api/auth/session/revalidate`).

### Changed
- Logout dibuat idempotent agar cookie tetap terhapus walau token invalid/expired.
- Validasi status login frontend beralih ke cek sesi backend (bukan sekadar ada cookie).

### Fixed
- Perbaikan loop redirect token expired (`/login -> /dashboard -> /401`).
- Perbaikan kondisi logout yang tidak konsisten.

## [v0.3.0] - 2026-02-21

### Added
- Halaman admin `/dashboard/admin`.
- Endpoint `GET /api/admin/overview`.
- Metrik admin:
  - total users/admins
  - auth events (total, hari ini, 7 hari, 30 hari)
  - breakdown event auth.

### Changed
- Guard admin dipercepat di proxy agar user non-admin langsung ke `/403` tanpa flicker.

## [v0.2.0] - 2026-02-21

### Added
- Rate limit endpoint sensitif:
  - OAuth redirect/callback
  - auth session
  - me
  - refresh
  - logout
- Monitoring endpoint auth dengan `request_id` dan durasi request.
- Security headers frontend + backend:
  - CSP
  - HSTS (production)
  - X-Frame-Options
  - X-Content-Type-Options
  - Referrer-Policy
  - Permissions-Policy
- Alert lonjakan `oauth_failed` berbasis cache window + cooldown.

### Security
- CORS backend diperketat via whitelist origin (`FRONTEND_URLS`).

## [v0.1.0] - 2026-02-21

### Added
- Login Google OAuth end-to-end.
- Session cookie httpOnly (`auth_token`) dengan Sanctum.
- Halaman inti frontend:
  - `/`, `/login`, `/auth/callback`, `/dashboard`
  - `/401`, `/403`, `/500`, `not-found`
- Role dasar `user` dan `admin`.
- Audit log autentikasi dengan retensi 5 data terbaru.
- Reusable UI components dan helper auth/frontend.

### Docs
- README root, backend, frontend awal.