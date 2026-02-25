"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type LoketSnapshot } from "@/lib/api-loket-queue";
import { getQueueEcho } from "@/lib/reverb";
import { AppPanel } from "@/lib/ui";

type KioskRuanganClientProps = {
  slug: string;
};

export default function KioskRuanganClient({ slug }: KioskRuanganClientProps) {
  const [snapshot, setSnapshot] = useState<LoketSnapshot | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRealtimeAt, setLastRealtimeAt] = useState<number>(0);
  const lastCalledAtRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/kiosk/${slug}/snapshot`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const payload = (await response.json()) as LoketSnapshot | { message?: string };
      if (!response.ok) {
        setError(("message" in payload && payload.message) || "Gagal memuat display antrian.");
        return;
      }
      setError("");
      setSnapshot(payload as LoketSnapshot);
    } catch {
      setError("Gangguan jaringan saat memuat display.");
    } finally {
      setIsInitialLoading(false);
    }
  }, [slug]);

  const speakIndonesian = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice =
      voices.find((voice) => voice.lang.toLowerCase().startsWith("id")) ??
      voices.find((voice) => voice.name.toLowerCase().includes("indonesia")) ??
      null;
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.hidden) {
        return;
      }

      // Reverb already gives near-real-time updates; poll lightly as fallback.
      if (lastRealtimeAt > 0 && Date.now() - lastRealtimeAt < 12_000) {
        return;
      }

      void refresh();
    }, 8_000);
    return () => window.clearInterval(timer);
  }, [lastRealtimeAt, refresh]);

  useEffect(() => {
    if (!snapshot) return;
    const latest = snapshot.latest_call;
    if (!latest || !latest.called_at) return;
    if (latest.called_at === lastCalledAtRef.current) return;

    lastCalledAtRef.current = latest.called_at;
    speakIndonesian(latest.voice_text);
  }, [snapshot, speakIndonesian]);

  useEffect(() => {
    const echo = getQueueEcho();
    if (!echo) {
      return;
    }

    const channelName = `loket.${slug}`;
    echo.channel(channelName).listen(
      ".queue.updated",
      (payload: { action?: string; called_at?: string; voice_text?: string }) => {
        setLastRealtimeAt(Date.now());
        if ((payload.action === "called" || payload.action === "recalled") && payload.voice_text) {
          if (payload.called_at) {
            lastCalledAtRef.current = payload.called_at;
          }
          speakIndonesian(payload.voice_text);
        }
        void refresh();
      },
    );

    return () => {
      echo.leave(channelName);
    };
  }, [refresh, slug, speakIndonesian]);

  if (isInitialLoading) {
    return <p className="mx-auto w-full max-w-6xl text-sm text-zinc-500">Memuat display antrian...</p>;
  }

  if (!snapshot) {
    return (
      <p className="mx-auto w-full max-w-6xl rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        Gagal memuat display antrian.
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Kiosk Ruangan</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">{snapshot.loket.name}</h1>
      </header>

      <AppPanel className="border-zinc-900 bg-zinc-900 p-8 text-white">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-300">Sedang Dilayani</p>
        <p className="mt-3 text-6xl font-bold">{snapshot.serving?.ticket_no ?? "-"}</p>
      </AppPanel>

      <AppPanel className="mt-6 p-6">
        <h2 className="text-base font-semibold text-zinc-900">Antrian Menunggu</h2>
        {snapshot.waiting.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Tidak ada antrian menunggu.</p>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {snapshot.waiting.slice(0, 12).map((item) => (
              <div key={item.id} className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
                <p className="text-sm text-zinc-500">{item.user?.name ?? "-"}</p>
                <p className="text-xl font-semibold text-zinc-900">{item.ticket_no}</p>
              </div>
            ))}
          </div>
        )}
      </AppPanel>

      {error ? (
        <p className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
