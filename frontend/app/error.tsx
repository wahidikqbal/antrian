"use client";

import { useEffect } from "react";
import { AppLinkButton, AppPanel } from "@/lib/ui";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12">
      <AppPanel className="w-full max-w-md p-8 text-center shadow-[0_18px_70px_-45px_rgba(15,23,42,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Application Error
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-900">
          Terjadi kesalahan tak terduga
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Kamu bisa mencoba ulang, atau kembali ke beranda.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Coba Ulang
          </button>
          <AppLinkButton href="/" variant="outline">
            Home
          </AppLinkButton>
        </div>
      </AppPanel>
    </div>
  );
}
