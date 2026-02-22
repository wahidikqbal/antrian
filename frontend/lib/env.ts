export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}

export function getAuthCookieName() {
  return process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? "auth_token";
}
