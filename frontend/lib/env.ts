export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}

export function getFrontendUrl() {
  return process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:3000";
}

export function getSessionCookieName() {
  return process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME ?? "laravel-session";
}

export function getCsrfGuardHeaderName() {
  return process.env.NEXT_PUBLIC_CSRF_GUARD_HEADER_NAME ?? "X-CSRF-Guard";
}

export function getCsrfGuardHeaderValue() {
  return process.env.NEXT_PUBLIC_CSRF_GUARD_HEADER_VALUE ?? "1";
}

export function getSessionCookieNames() {
  const primary = getSessionCookieName();
  const candidates = [primary];

  if (primary.includes("-")) {
    candidates.push(primary.replace(/-/g, "_"));
  } else if (primary.includes("_")) {
    candidates.push(primary.replace(/_/g, "-"));
  }

  return Array.from(new Set(candidates));
}

export function getReverbAppKey() {
  return process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? "";
}

export function getReverbHost() {
  return process.env.NEXT_PUBLIC_REVERB_HOST ?? "localhost";
}

export function getReverbPort() {
  const raw = process.env.NEXT_PUBLIC_REVERB_PORT ?? "8080";
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? 8080 : parsed;
}

export function getReverbScheme() {
  return process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http";
}
