# Security Policy

## Supported Scope

Repositori ini adalah `auth-starter` berbasis:
- Laravel 12 + Sanctum (session-first)
- Next.js App Router

Area sensitif:
- OAuth callback/login flow
- Session + CSRF flow
- Middleware trusted origin / role / auth monitor
- Endpoint auth (`/api/auth/*`, `/api/me*`, `/api/admin/*`, `/api/logout`)

## Reporting a Vulnerability

Jika menemukan isu keamanan:
1. Jangan buat issue publik dengan detail exploit.
2. Kirim laporan privat ke maintainer project beserta:
   - ringkasan risiko
   - langkah reproduksi
   - dampak
   - usulan mitigasi
3. Sertakan commit hash/versi yang terdampak.

## Response Targets

Target operasional:
- Acknowledgement awal: maksimal 48 jam.
- Triage: maksimal 5 hari kerja.
- Patch awal (jika valid): secepat mungkin sesuai tingkat risiko.

## Security Baseline

Untuk deployment production, minimum:
- HTTPS end-to-end
- `SESSION_SECURE_COOKIE=true`
- `TRUSTED_FRONTEND_ORIGINS` terisi domain frontend valid
- `SANCTUM_STATEFUL_DOMAINS` terisi domain stateful valid
- Jalankan `php artisan auth:config-check --strict`
- Rotasi secret jika pernah terekspos
