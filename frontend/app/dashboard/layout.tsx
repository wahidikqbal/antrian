import type { ReactNode } from "react";
import SessionRefresher from "./SessionRefresher";
import DashboardSidebar from "./DashboardSidebar";
import { requireAuthUser } from "@/lib/server-auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = await requireAuthUser();

  return (
    <div className="min-h-screen bg-zinc-50">
      <SessionRefresher />
      <DashboardSidebar
        user={{
          name: user.name,
          email: user.email,
          role: user.role,
        }}
      >
        {children}
      </DashboardSidebar>
    </div>
  );
}
