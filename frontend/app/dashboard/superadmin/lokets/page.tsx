import { redirect } from "next/navigation";
import SuperadminLoketsClient from "./SuperadminLoketsClient";
import { getSuperadminLokets } from "@/lib/api-loket-queue";
import { requireSuperadminUser } from "@/lib/server-auth";

export default async function SuperadminLoketsPage() {
  const { cookieHeader } = await requireSuperadminUser();
  const result = await getSuperadminLokets(cookieHeader);

  if (result.kind === "unauthorized") redirect("/401");
  if (result.kind === "forbidden") redirect("/403");
  if (result.kind === "error") redirect("/500");

  return <SuperadminLoketsClient initialLokets={result.data} />;
}
