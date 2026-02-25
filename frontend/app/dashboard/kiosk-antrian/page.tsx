import { redirect } from "next/navigation";
import KioskAntrianClient from "./KioskAntrianClient";
import { requireAuthUser } from "@/lib/server-auth";

export default async function DashboardKioskAntrianPage() {
  const result = await requireAuthUser();

  if (!result.user) {
    redirect("/401");
  }

  return <KioskAntrianClient />;
}
