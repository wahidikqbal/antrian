"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BellRing, RotateCcw } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { getCsrfHeaders } from "@/lib/csrf";
import { type LoketSnapshot } from "@/lib/api-loket-queue";
import { getQueueEcho } from "@/lib/reverb";
import { AppPanel, InfoTile } from "@/lib/ui";

type AdminLoketClientProps = {
  slug: string;
};

function statusLabel(status: string) {
  if (status === "waiting") return "Menunggu";
  if (status === "serving") return "Dilayani";
  if (status === "completed") return "Selesai";
  if (status === "canceled") return "Batal";
  return status;
}

export default function AdminLoketClient({ slug }: AdminLoketClientProps) {
  const [snapshot, setSnapshot] = useState<LoketSnapshot | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastRealtimeAt, setLastRealtimeAt] = useState<number>(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<{ id: number; ticketNo: string } | null>(null);
  const isRefreshingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (isRefreshingRef.current) {
      return;
    }

    isRefreshingRef.current = true;
    try {
      const response = await fetch(`/api/admin-loket/${slug}/snapshot`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const payload = (await response.json()) as LoketSnapshot | { message?: string };
      if (!response.ok) {
        setMessage(("message" in payload && payload.message) || "Gagal memuat snapshot loket.");
        return;
      }
      setSnapshot(payload as LoketSnapshot);
    } catch {
      setMessage("Gagal menghubungi server.");
    } finally {
      isRefreshingRef.current = false;
      setIsInitialLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.hidden) {
        return;
      }

      // If Reverb event has arrived recently, skip polling to reduce load.
      if (lastRealtimeAt > 0 && Date.now() - lastRealtimeAt < 12_000) {
        return;
      }

      void refresh();
    }, 10_000);
    return () => window.clearInterval(timer);
  }, [lastRealtimeAt, refresh]);

  useEffect(() => {
    const echo = getQueueEcho();
    if (!echo) {
      return;
    }

    const channelName = `loket.${slug}`;
    echo.channel(channelName).listen(".queue.updated", () => {
      setLastRealtimeAt(Date.now());
      void refresh();
    });

    return () => {
      echo.leave(channelName);
    };
  }, [refresh, slug]);

  const callNext = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      await getCsrfHeaders();
      const response = await fetch(`/api/admin-loket/${slug}/call-next`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(payload.message ?? "Gagal memanggil antrian.");
        return;
      }
      await refresh();
      setMessage(payload.message ?? "Antrian dipanggil.");
    } catch {
      setMessage("Gangguan jaringan saat memanggil antrian.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return <p className="mx-auto w-full max-w-6xl text-sm text-zinc-500">Memuat data loket...</p>;
  }

  if (!snapshot) {
    return (
      <p className="mx-auto w-full max-w-6xl rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        Gagal memuat data loket.
      </p>
    );
  }

  const callTicket = async (ticketId: number) => {
    setIsLoading(true);
    setMessage("");
    try {
      await getCsrfHeaders();
      const response = await fetch(`/api/admin-loket/${slug}/tickets/${ticketId}/call`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(payload.message ?? "Gagal memanggil tiket.");
        return;
      }
      await refresh();
      setMessage(payload.message ?? "Tiket berhasil dipanggil.");
    } catch {
      setMessage("Gangguan jaringan saat memanggil tiket.");
    } finally {
      setIsLoading(false);
    }
  };

  const setStatus = async (ticketId: number, status: "waiting" | "completed" | "canceled") => {
    setIsLoading(true);
    setMessage("");
    try {
      await getCsrfHeaders();
      const response = await fetch(`/api/admin-loket/${slug}/tickets/${ticketId}/status`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(payload.message ?? "Gagal mengubah status.");
        return;
      }
      await refresh();
      if (status === "canceled") {
        setMessage(payload.message ?? "Antrian dihapus.");
      } else {
        setMessage(payload.message ?? "Status diperbarui.");
      }
    } catch {
      setMessage("Gangguan jaringan saat mengubah status.");
    } finally {
      setIsLoading(false);
    }
  };

  const requestDeleteTicket = (ticketId: number, ticketNo: string) => {
    setTicketToDelete({ id: ticketId, ticketNo });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTicket = async () => {
    if (!ticketToDelete) {
      return;
    }

    await setStatus(ticketToDelete.id, "canceled");
    setDeleteDialogOpen(false);
    setTicketToDelete(null);
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Admin Loket</p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">{snapshot.loket.name}</h1>
          <p className="mt-1 text-sm text-zinc-600">Ruangan: {snapshot.loket.room_name ?? "-"}</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void refresh()} disabled={isLoading}>
          <RotateCcw className="size-4" />
          Refresh
        </Button>
      </header>

      <AppPanel className="p-6">
        <dl className="grid gap-4 sm:grid-cols-3">
          <InfoTile label="Menunggu" value={snapshot.summary.waiting_count} />
          <InfoTile label="Dilayani" value={snapshot.summary.serving_count} />
          <InfoTile label="Selesai" value={snapshot.summary.completed_count} />
        </dl>
      </AppPanel>

      <AppPanel className="mt-6 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-zinc-600">Sedang Dilayani</p>
            <p className="text-3xl font-bold text-zinc-900">{snapshot.serving?.ticket_no ?? "-"}</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={callNext} disabled={isLoading}>
              <BellRing className="size-4" />
              Panggil
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => snapshot.serving && void callTicket(snapshot.serving.id)}
              disabled={isLoading || !snapshot.serving}
            >
              Panggil Ulang
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => snapshot.serving && void setStatus(snapshot.serving.id, "waiting")}
              disabled={isLoading || !snapshot.serving}
            >
              Kembali Menunggu
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => snapshot.serving && void setStatus(snapshot.serving.id, "completed")}
              disabled={isLoading || !snapshot.serving}
            >
              Selesai
            </Button>
          </div>
        </div>
      </AppPanel>

      <AppPanel className="mt-6 p-6">
        <h2 className="text-base font-semibold text-zinc-900">Daftar Menunggu</h2>
        {snapshot.waiting.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Tidak ada antrian menunggu.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-xl border border-zinc-200">
              <thead className="bg-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-3 py-2">Nomor</th>
                  <th className="px-3 py-2">Nama</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white text-sm text-zinc-700">
                {snapshot.waiting.map((ticket, index) => (
                  <tr
                    key={ticket.id}
                    className={index < snapshot.waiting.length - 1 ? "border-b border-zinc-100" : ""}
                  >
                    <td className="px-3 py-2 font-semibold">{ticket.ticket_no}</td>
                    <td className="px-3 py-2">{ticket.user?.name ?? "-"}</td>
                    <td className="px-3 py-2">{statusLabel(ticket.status)}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => void callTicket(ticket.id)}
                          disabled={isLoading}
                        >
                          Panggil
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => requestDeleteTicket(ticket.id, ticket.ticket_no)}
                          disabled={isLoading}
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AppPanel>

      {message ? (
        <p className="mt-6 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
          {message}
        </p>
      ) : null}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus antrian ini?"
        description={`Nomor ${ticketToDelete?.ticketNo ?? "-"} akan dihapus dari daftar menunggu.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        confirmVariant="destructive"
        isLoading={isLoading}
        onConfirm={confirmDeleteTicket}
      />
    </div>
  );
}
