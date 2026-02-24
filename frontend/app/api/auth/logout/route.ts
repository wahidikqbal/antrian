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
    const response = NextResponse.json({ message: "Already logged out" }, { status: 200 });
    sessionCookieNames.forEach((name) => response.cookies.delete(name));
    return response;
  }

  try {
    const upstream = await fetch(`${apiBaseUrl}/api/logout`, {
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

    const response = NextResponse.json(
      { message: upstream.ok ? "Logged out" : "Logout failed" },
      { status: upstream.status },
    );

    if (upstream.ok || upstream.status === 401) {
      sessionCookieNames.forEach((name) => response.cookies.delete(name));
      response.cookies.delete("XSRF-TOKEN");
    }

    return response;
  } catch {
    return NextResponse.json({ message: "Logout upstream error" }, { status: 502 });
  }
}
