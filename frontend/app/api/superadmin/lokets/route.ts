import { NextRequest } from "next/server";
import { proxyQueueRequest } from "@/lib/queue-proxy";

export async function GET(request: NextRequest) {
  return proxyQueueRequest(request, {
    path: "/api/superadmin/lokets",
    method: "GET",
  });
}

export async function POST(request: NextRequest) {
  return proxyQueueRequest(request, {
    path: "/api/superadmin/lokets",
    method: "POST",
    requireCsrf: true,
  });
}
