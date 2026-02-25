import { NextRequest } from "next/server";
import { proxyQueueRequest } from "@/lib/queue-proxy";

export async function POST(request: NextRequest) {
  return proxyQueueRequest(request, {
    path: "/api/kiosk/tickets",
    method: "POST",
    requireCsrf: true,
  });
}
