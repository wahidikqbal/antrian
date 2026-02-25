import { NextRequest } from "next/server";
import { proxyQueueRequest } from "@/lib/queue-proxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyQueueRequest(request, {
    path: `/api/superadmin/lokets/${id}/admins`,
    method: "POST",
    requireCsrf: true,
  });
}
