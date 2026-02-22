import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkAdminRole, checkSession } from "@/lib/auth-session";
import { getAuthCookieName } from "@/lib/env";

export async function proxy(request: NextRequest) {
  const authCookieName = getAuthCookieName();
  const token = request.cookies.get(authCookieName)?.value;
  const { pathname } = request.nextUrl;
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isTemplatesRoute = pathname.startsWith("/templates");
  const isAdminDashboardRoute = pathname.startsWith("/dashboard/admin");
  const isLoginRoute = pathname === "/login";
  const isProtectedRoute = isDashboardRoute || isTemplatesRoute;

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/401", request.url));
  }

  if (!token) {
    return NextResponse.next();
  }

  const session = await checkSession(token);

  if (!session.isValid) {
    if (isProtectedRoute) {
      const response = NextResponse.redirect(new URL("/401", request.url));
      if (session.shouldClearCookie) {
        response.cookies.delete(authCookieName);
      }
      return response;
    }

    if (isLoginRoute) {
      const response = NextResponse.next();
      if (session.shouldClearCookie) {
        response.cookies.delete(authCookieName);
      }
      return response;
    }

    const response = NextResponse.next();
    if (session.shouldClearCookie) {
      response.cookies.delete(authCookieName);
    }
    return response;
  }

  if (isLoginRoute && session.isValid) {
    return NextResponse.redirect(new URL("/dashboard/users", request.url));
  }

  if (isAdminDashboardRoute) {
    const adminCheck = await checkAdminRole(token);

    if (adminCheck.kind === "unauthorized") {
      const response = NextResponse.redirect(new URL("/401", request.url));
      if (adminCheck.shouldClearCookie) {
        response.cookies.delete(authCookieName);
      }
      return response;
    }

    if (adminCheck.kind === "non_admin") {
      return NextResponse.redirect(new URL("/403", request.url));
    }

    if (adminCheck.kind === "error") {
      return NextResponse.redirect(new URL("/500", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/templates/:path*", "/dashboard/:path*"],
};
