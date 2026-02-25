import { NextRequest, NextResponse } from "next/server";
import { getCsrfGuardHeaderName, getCsrfGuardHeaderValue } from "@/lib/env";
import { getServerApiBaseUrl } from "@/lib/server-api";

type ProxyOptions = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  requireCsrf?: boolean;
};

export async function proxyQueueRequest(
  request: NextRequest,
  { path, method = "GET", requireCsrf = false }: ProxyOptions,
) {
  const apiBaseUrl = getServerApiBaseUrl();
  const cookieHeader = request.headers.get("cookie") ?? "";
  const xsrfToken = request.cookies.get("XSRF-TOKEN")?.value;
  const csrfGuardHeaderName = getCsrfGuardHeaderName();
  const csrfGuardHeaderValue = getCsrfGuardHeaderValue();

  const headers: Record<string, string> = {
    Accept: "application/json",
    Cookie: cookieHeader,
    Origin: request.nextUrl.origin,
  };

  if (requireCsrf) {
    headers["X-XSRF-TOKEN"] = xsrfToken ? decodeURIComponent(xsrfToken) : "";
    headers[csrfGuardHeaderName] = csrfGuardHeaderValue;
  }

  try {
    const bodyText = method === "GET" || method === "DELETE" ? undefined : await request.text();
    if (bodyText && bodyText.length > 0) {
      headers["Content-Type"] = request.headers.get("content-type") ?? "application/json";
    }

    const upstream = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers,
      body: bodyText,
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? ((await upstream.json()) as unknown)
      : { message: upstream.statusText };

    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return NextResponse.json({ message: "Queue upstream error" }, { status: 502 });
  }
}
