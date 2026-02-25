"use client";

import { useEffect, useState } from "react";
import { Ticket, UserRoundPlus } from "lucide-react";
import { getCsrfHeaders } from "@/lib/csrf";
import { type LoketItem } from "@/lib/api-loket-queue";
import { AppPanel } from "@/lib/ui";

type TicketResponse = {
  message?: string;
  ticket?: {
    id: number;
    ticket_no: string;
    queue_date: string;
    status: string;
    loket: {
      id: number;
      name: string;
      slug: string;
      code: string;
    };
  };
};

export default function KioskAntrianClient() {
  const [lokets, setLokets] = useState<LoketItem[]>([]);
  const [isLoketsLoading, setIsLoketsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TicketResponse | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadLokets = async () => {
      try {
        const response = await fetch("/api/lokets", {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        const payload = (await response.json()) as LoketItem[] | { message?: string };
        if (!response.ok) {
          setError(("message" in payload && payload.message) || "Gagal memuat daftar layanan.");
          return;
        }

        setLokets(payload as LoketItem[]);
      } catch {
        setError("Terjadi gangguan jaringan saat memuat layanan.");
      } finally {
        setIsLoketsLoading(false);
      }
    };

    void loadLokets();
  }, []);

  const takeTicket = async (loketSlug: string) => {
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      await getCsrfHeaders();
      const response = await fetch("/api/kiosk/tickets", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loket_slug: loketSlug }),
      });

      const payload = (await response.json()) as TicketResponse;
      if (!response.ok) {
        setError(payload.message ?? "Gagal mengambil nomor antrian.");
        return;
      }

      setResult(payload);
    } catch {
      setError("Terjadi gangguan jaringan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Kiosk Lobby</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Ambil Nomor Antrian</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Pilih layanan/loket untuk membuat nomor antrian otomatis.
        </p>
      </header>

      <AppPanel className="p-6">
        <h2 className="text-base font-semibold text-zinc-900">Daftar Layanan</h2>
        {isLoketsLoading ? <p className="mt-3 text-sm text-zinc-500">Memuat layanan...</p> : null}
        {!isLoketsLoading ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lokets.map((loket) => (
              <button
                key={loket.id}
                type="button"
                onClick={() => void takeTicket(loket.slug)}
                disabled={isLoading}
                className="rounded-xl border border-zinc-200 bg-white p-4 text-left transition hover:border-zinc-400 hover:bg-zinc-50 disabled:opacity-50"
              >
                <p className="text-xs uppercase tracking-wide text-zinc-500">{loket.code}</p>
                <p className="mt-1 font-semibold text-zinc-900">{loket.name}</p>
                <p className="mt-1 text-sm text-zinc-600">{loket.room_name ?? "-"}</p>
              </button>
            ))}
          </div>
        ) : null}
      </AppPanel>

      {result?.ticket ? (
        <AppPanel className="mt-6 border-zinc-900 bg-zinc-900 p-8 text-white">
          <div className="flex items-center gap-2 text-zinc-300">
            <Ticket className="size-4" />
            <span className="text-sm uppercase tracking-[0.15em]">Nomor Anda</span>
          </div>
          <p className="mt-3 text-5xl font-bold">{result.ticket.ticket_no}</p>
          <p className="mt-2 text-sm text-zinc-300">Tujuan: {result.ticket.loket.name}</p>
        </AppPanel>
      ) : null}

      {error ? (
        <p className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {!result && !error ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-zinc-500">
          <UserRoundPlus className="size-4" />
          Klik salah satu layanan untuk mendapatkan nomor antrian.
        </div>
      ) : null}
    </div>
  );
}
