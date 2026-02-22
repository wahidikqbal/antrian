import { AppPanel } from "@/lib/ui";

export default function DashboardWebsitesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Main
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Websites</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Kelola daftar website yang terhubung dengan akun kamu.
        </p>
      </header>

      <AppPanel className="p-6">
        <h2 className="text-base font-semibold text-zinc-900">Website List</h2>
        <p className="mt-3 text-sm text-zinc-500">
          Belum ada website yang ditambahkan. Halaman ini siap dipakai untuk fitur CRUD
          website berikutnya.
        </p>
      </AppPanel>
    </div>
  );
}
