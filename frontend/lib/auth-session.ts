import { getApiBaseUrl } from "@/lib/env";

export type SessionCheckResult = {
  isValid: boolean;
  shouldClearCookie: boolean;
};

export type AdminCheckResult =
  | { kind: "admin" }
  | { kind: "non_admin" }
  | { kind: "unauthorized"; shouldClearCookie: boolean }
  | { kind: "error" };

export async function checkSession(token: string | undefined): Promise<SessionCheckResult> {
  if (!token) {
    return { isValid: false, shouldClearCookie: false };
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/auth/session`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      next: {
        revalidate: 30,
        tags: ["auth-session"],
      },
    });

    if (response.status === 204) {
      return { isValid: true, shouldClearCookie: false };
    }

    return { isValid: false, shouldClearCookie: true };
  } catch {
    return { isValid: false, shouldClearCookie: false };
  }
}

export async function hasValidSession(token: string | undefined): Promise<boolean> {
  const result = await checkSession(token);
  return result.isValid;
}

export async function checkAdminRole(token: string | undefined): Promise<AdminCheckResult> {
  if (!token) {
    return { kind: "unauthorized", shouldClearCookie: false };
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      next: {
        revalidate: 15,
        tags: ["auth-role"],
      },
    });

    if (response.status === 401) {
      return { kind: "unauthorized", shouldClearCookie: true };
    }

    if (!response.ok) {
      return { kind: "error" };
    }

    const me = (await response.json()) as { role?: string };

    return me.role === "admin" ? { kind: "admin" } : { kind: "non_admin" };
  } catch {
    return { kind: "error" };
  }
}
