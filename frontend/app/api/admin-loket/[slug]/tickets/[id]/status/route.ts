import { NextRequest } from "next/server";
import { proxyQueueRequest } from "@/lib/queue-proxy";

type RouteContext = {
  params: Promise<{ slug: string; id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { slug, id } = await context.params;

  return proxyQueueRequest(request, {
    path: `/api/admin-loket/${slug}/tickets/${id}/status`,
    method: "POST",
    requireCsrf: true,
  });
}
