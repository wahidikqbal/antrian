export default async function DashboardUsersPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Main
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Dashboard Users</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Selamat datang di workspace OyiWeb. Gunakan menu di sidebar untuk berpindah
          ke Websites, Activities, dan halaman lain.
        </p>
      </header>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900">Quick Start</h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-600">
          <li>- Buka menu Websites untuk mengelola website project.</li>
          <li>- Buka menu Activities untuk melihat account overview dan auth activity.</li>
          <li>- Buka Templates untuk menyiapkan halaman siap pakai.</li>
        </ul>
      </div>
    </div>
  );
}
