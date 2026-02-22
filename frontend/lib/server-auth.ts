import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMe, type MeResponse } from "@/lib/api-auth";
import { getAuthCookieName } from "@/lib/env";

const resolveUserByToken = cache(async (token: string): Promise<MeResponse> => {
  const result = await getMe(token);

  if (result.kind === "unauthorized" || result.kind === "forbidden") {
    redirect("/401");
  }

  if (result.kind === "error") {
    redirect("/500");
  }

  return result.data;
});

export async function requireAuthUser(): Promise<{ token: string; user: MeResponse }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;

  if (!token) {
    redirect("/401");
  }

  const user = await resolveUserByToken(token);

  return { token, user };
}

export async function requireAdminUser(): Promise<{ token: string; user: MeResponse }> {
  const { token, user } = await requireAuthUser();

  if (user.role !== "admin") {
    redirect("/403");
  }

  return { token, user };
}
