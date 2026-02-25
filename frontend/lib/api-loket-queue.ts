import { getFrontendUrl } from "@/lib/env";
import { getServerApiBaseUrl } from "@/lib/server-api";

export type LoketItem = {
  id: number;
  name: string;
  slug: string;
  code: string;
  room_name: string | null;
};

export type LoketQueueTicket = {
  id: number;
  ticket_no: string;
  sequence_no: number;
  status: "waiting" | "serving" | "completed" | "canceled";
  called_at: string | null;
  completed_at: string | null;
  created_at: string;
  user: { id: number; name: string } | null;
  served_by: { id: number; name: string } | null;
};

export type LoketSnapshot = {
  loket: LoketItem;
  date: string;
  serving: LoketQueueTicket | null;
  waiting: LoketQueueTicket[];
  summary: {
    waiting_count: number;
    serving_count: number;
    completed_count: number;
  };
  latest_call: {
    ticket_no: string;
    voice_text: string;
    called_at: string;
  } | null;
};

export type SuperadminLoket = LoketItem & {
  is_active: boolean;
  admins: Array<{ id: number; name: string; email: string; role: string }>;
};

type ApiResultOk<T> = { kind: "ok"; data: T };
type ApiResultUnauthorized = { kind: "unauthorized" };
type ApiResultForbidden = { kind: "forbidden" };
type ApiResultError = { kind: "error" };

export type ApiResult<T> =
  | ApiResultOk<T>
  | ApiResultUnauthorized
  | ApiResultForbidden
  | ApiResultError;

async function fetchAuthed<T>(path: string, cookieHeader: string): Promise<ApiResult<T>> {
  const response = await fetch(`${getServerApiBaseUrl()}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
      Origin: getFrontendUrl(),
    },
    cache: "no-store",
  });

  if (response.status === 401) return { kind: "unauthorized" };
  if (response.status === 403) return { kind: "forbidden" };
  if (!response.ok) return { kind: "error" };
  return { kind: "ok", data: (await response.json()) as T };
}

export function getLokets(cookieHeader: string) {
  return fetchAuthed<LoketItem[]>("/api/lokets", cookieHeader);
}

export function getLoketSnapshot(cookieHeader: string, slug: string) {
  return fetchAuthed<LoketSnapshot>(`/api/lokets/${slug}/snapshot`, cookieHeader);
}

export function getSuperadminLokets(cookieHeader: string) {
  return fetchAuthed<SuperadminLoket[]>("/api/superadmin/lokets", cookieHeader);
}

export function getAdminLoketLokets(cookieHeader: string) {
  return fetchAuthed<LoketItem[]>("/api/admin-loket/lokets", cookieHeader);
}
