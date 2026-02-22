"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { AppLinkButton, AppPanel } from "@/lib/ui";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const login = searchParams.get("login");

  useEffect(() => {
    if (login && !error) {
      router.replace("/dashboard/users");
    }
  }, [error, login, router]);

  const view = useMemo(() => {
    if (error) {
      return {
        title: "Sign in failed",
        subtitle: `Google OAuth error: ${error}`,
        tone:
          "border-red-200 bg-red-50 text-red-700",
      };
    }

    if (!login) {
      return {
        title: "Invalid callback",
        subtitle: "Permintaan login tidak valid. Silakan ulangi proses login.",
        tone:
          "border-amber-200 bg-amber-50 text-amber-700",
      };
    }

    return {
      title: "Signing you in",
      subtitle: "Autentikasi berhasil. Mengarahkan ke dashboard...",
      tone:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }, [error, login]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_40%,_#ffffff_75%)] p-6">
      <AppPanel className="w-full max-w-md p-8 shadow-[0_24px_80px_-50px_rgba(15,23,42,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          OAuth Callback
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-900">
          {view.title}
        </h1>

        <div className={`mt-5 rounded-xl border px-4 py-3 text-sm ${view.tone}`}>
          {view.subtitle}
        </div>

        {!error && login ? (
          <div className="mt-6 flex items-center gap-3 text-sm text-zinc-500">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
            Redirecting...
          </div>
        ) : null}

        <div className="mt-7 flex items-center gap-3">
          <AppLinkButton href="/login" variant="primary">
            Back to Login
          </AppLinkButton>
          <AppLinkButton href="/" variant="outline">
            Home
          </AppLinkButton>
        </div>
      </AppPanel>
    </div>
  );
}

function AuthCallbackFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_40%,_#ffffff_75%)] p-6">
      <AppPanel className="w-full max-w-md p-8 shadow-[0_24px_80px_-50px_rgba(15,23,42,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          OAuth Callback
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-900">Loading callback</h1>
        <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
          Memverifikasi status login...
        </div>
      </AppPanel>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
