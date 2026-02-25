import { NextRequest } from "next/server";
import { proxyQueueRequest } from "@/lib/queue-proxy";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  const query = date ? `?date=${encodeURIComponent(date)}` : "";

  return proxyQueueRequest(request, {
    path: `/api/superadmin/reports/queues${query}`,
    method: "GET",
  });
}
