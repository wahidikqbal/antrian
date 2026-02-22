import type { ReactNode } from "react";
import { AppLinkButton } from "@/lib/ui";

type StatusAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "outline" | "danger";
};

type StatusPageProps = {
  code: string;
  title: string;
  description: string;
  badgeClassName: string;
  actions: StatusAction[];
};

export function StatusPageLayout({
  code,
  title,
  description,
  badgeClassName,
  actions,
}: StatusPageProps): ReactNode {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e4e4e73d_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e73d_1px,transparent_1px)] bg-[size:48px_48px]" />

      <section className="motion-safe-fade-up relative w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white/90 p-10 text-center shadow-[0_35px_120px_-70px_rgba(24,24,27,0.45)] backdrop-blur">
        <p
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${badgeClassName}`}
        >
          {code}
        </p>

        <h1 className="mt-6 text-5xl font-semibold leading-tight text-zinc-900 sm:text-6xl">
          {title}
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">
          {description}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {actions.map((action) => (
            <AppLinkButton
              key={`${action.href}-${action.label}`}
              href={action.href}
              variant={action.variant ?? "outline"}
              className="rounded-xl px-5 py-2.5"
            >
              {action.label}
            </AppLinkButton>
          ))}
        </div>
      </section>
    </main>
  );
}
