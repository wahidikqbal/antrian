import { AppLinkButton } from "@/lib/ui";

export default function NotFoundPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e4e4e73d_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e73d_1px,transparent_1px)] bg-[size:48px_48px]" />

      <section className="motion-safe-fade-up relative w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white/90 p-10 text-center shadow-[0_35px_120px_-70px_rgba(24,24,27,0.45)] backdrop-blur">
        <p className="inline-flex rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
          Error 404
        </p>

        <h1 className="mt-6 text-3xl font-black leading-tight tracking-tight text-zinc-900 sm:text-6xl md:text-7xl lg:text-8xl">
          Halaman tidak ditemukan
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">
          URL yang kamu buka tidak tersedia, sudah dipindahkan, atau kamu tidak punya
          akses ke halaman tersebut.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <AppLinkButton href="/" variant="primary" className="rounded-xl px-5 py-2.5">
            Kembali ke Home
          </AppLinkButton>
          
        </div>
      </section>
    </main>
  );
}
