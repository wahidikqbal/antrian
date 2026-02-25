import { NextRequest } from "next/server";
import { proxyQueueRequest } from "@/lib/queue-proxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyQueueRequest(request, {
    path: `/api/superadmin/lokets/${id}`,
    method: "PUT",
    requireCsrf: true,
  });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyQueueRequest(request, {
    path: `/api/superadmin/lokets/${id}`,
    method: "DELETE",
    requireCsrf: true,
  });
}
