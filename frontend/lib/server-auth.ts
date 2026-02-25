import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMe, type MeResponse } from "@/lib/api-auth";
import { getSessionCookieNames } from "@/lib/env";

const resolveUserByCookieHeader = cache(async (cookieHeader: string): Promise<MeResponse> => {
  const result = await getMe(cookieHeader);

  if (result.kind === "unauthorized" || result.kind === "forbidden") {
    redirect("/401");
  }

  if (result.kind === "error") {
    redirect("/500");
  }

  return result.data;
});

export async function requireAuthUser(): Promise<{ cookieHeader: string; user: MeResponse }> {
  const cookieStore = await cookies();
  const hasSessionCookie = getSessionCookieNames().some(
    (cookieName) => Boolean(cookieStore.get(cookieName)?.value),
  );

  if (!hasSessionCookie) {
    redirect("/401");
  }

  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  const user = await resolveUserByCookieHeader(cookieHeader);

  return { cookieHeader, user };
}

export async function requireAdminUser(): Promise<{ cookieHeader: string; user: MeResponse }> {
  const { cookieHeader, user } = await requireAuthUser();

  if (user.role !== "admin" && user.role !== "superadmin") {
    redirect("/403");
  }

  return { cookieHeader, user };
}

export async function requireSuperadminUser(): Promise<{ cookieHeader: string; user: MeResponse }> {
  const { cookieHeader, user } = await requireAuthUser();

  if (user.role !== "admin" && user.role !== "superadmin") {
    redirect("/403");
  }

  return { cookieHeader, user };
}

export async function requireAdminLoketUser(): Promise<{ cookieHeader: string; user: MeResponse }> {
  const { cookieHeader, user } = await requireAuthUser();

  if (!["admin", "superadmin", "admin_loket"].includes(user.role)) {
    redirect("/403");
  }

  return { cookieHeader, user };
}
