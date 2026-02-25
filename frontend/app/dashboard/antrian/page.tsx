import { redirect } from "next/navigation";

export default async function DashboardQueuePage() {
  redirect("/dashboard/kiosk-antrian");
}
