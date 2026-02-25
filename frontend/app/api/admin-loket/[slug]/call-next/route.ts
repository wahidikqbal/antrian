import { NextRequest } from "next/server";
import { proxyQueueRequest } from "@/lib/queue-proxy";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;

  return proxyQueueRequest(request, {
    path: `/api/admin-loket/${slug}/call-next`,
    method: "POST",
    requireCsrf: true,
  });
}
