import { NextRequest, NextResponse } from "next/server";
import {
  getCsrfGuardHeaderName,
  getCsrfGuardHeaderValue,
  getSessionCookieNames,
} from "@/lib/env";
import { getServerApiBaseUrl } from "@/lib/server-api";

export async function POST(request: NextRequest) {
  const apiBaseUrl = getServerApiBaseUrl();
  const csrfGuardHeaderName = getCsrfGuardHeaderName();
  const csrfGuardHeaderValue = getCsrfGuardHeaderValue();
  const sessionCookieNames = getSessionCookieNames();
  const hasSession = sessionCookieNames.some((name) => Boolean(request.cookies.get(name)?.value));
  const cookieHeader = request.headers.get("cookie") ?? "";
  const xsrfToken = request.cookies.get("XSRF-TOKEN")?.value;

  if (!hasSession) {
    return NextResponse.json({ message: "No active session" }, { status: 401 });
  }

  try {
    const upstream = await fetch(`${apiBaseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
        Origin: request.nextUrl.origin,
        "X-XSRF-TOKEN": xsrfToken ? decodeURIComponent(xsrfToken) : "",
        [csrfGuardHeaderName]: csrfGuardHeaderValue,
      },
      cache: "no-store",
    });

    return NextResponse.json(
      { message: upstream.ok ? "Session refreshed" : "Refresh failed" },
      { status: upstream.status },
    );
  } catch {
    return NextResponse.json({ message: "Refresh upstream error" }, { status: 502 });
  }
}
