import { NextRequest } from "next/server";
import { proxyQueueRequest } from "@/lib/queue-proxy";

type RouteContext = {
  params: Promise<{ id: string; userId: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id, userId } = await context.params;
  return proxyQueueRequest(request, {
    path: `/api/superadmin/lokets/${id}/admins/${userId}`,
    method: "DELETE",
    requireCsrf: true,
  });
}
