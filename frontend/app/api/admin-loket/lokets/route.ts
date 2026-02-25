import { NextRequest } from "next/server";
import { proxyQueueRequest } from "@/lib/queue-proxy";

export async function GET(request: NextRequest) {
  return proxyQueueRequest(request, {
    path: "/api/admin-loket/lokets",
    method: "GET",
  });
}
