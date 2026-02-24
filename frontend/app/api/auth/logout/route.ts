import { NextRequest, NextResponse } from "next/server";

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}

function getAuthCookieName() {
  return process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? "auth_token";
}

export async function POST(request: NextRequest) {
  const authCookieName = getAuthCookieName();
  const token = request.cookies.get(authCookieName)?.value;

  if (!token) {
    const response = NextResponse.json({ message: "Already logged out" }, { status: 200 });
    response.cookies.delete(authCookieName);
    return response;
  }

  try {
    const upstream = await fetch(`${getApiBaseUrl()}/api/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        Origin: request.nextUrl.origin,
        "X-CSRF-Guard": "1",
      },
      cache: "no-store",
    });

    const response = NextResponse.json(
      { message: upstream.ok ? "Logged out" : "Logout failed" },
      { status: upstream.status },
    );

    if (upstream.ok || upstream.status === 401) {
      response.cookies.delete(authCookieName);
    }

    return response;
  } catch {
    return NextResponse.json({ message: "Logout upstream error" }, { status: 502 });
  }
}
