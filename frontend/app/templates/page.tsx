import { AppLinkButton, AppPanel } from "@/lib/ui";

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10">
      <main className="mx-auto w-full max-w-5xl">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Other
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Templates</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Kumpulan template siap pakai untuk halaman produk kamu.
          </p>
        </header>

        <AppPanel className="p-6">
          <p className="text-sm text-zinc-600">
            Belum ada template yang dipublikasikan. Halaman ini disiapkan untuk fitur
            template library di iterasi berikutnya.
          </p>
          <div className="mt-5">
            <AppLinkButton href="/dashboard/users" variant="outline">
              Kembali ke Dashboard
            </AppLinkButton>
          </div>
        </AppPanel>
      </main>
    </div>
  );
}
