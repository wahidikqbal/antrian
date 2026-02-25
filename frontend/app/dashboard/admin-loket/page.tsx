import Link from "next/link";
import { redirect } from "next/navigation";
import { AppPanel } from "@/lib/ui";
import { getAdminLoketLokets } from "@/lib/api-loket-queue";
import { requireAdminLoketUser } from "@/lib/server-auth";

export default async function AdminLoketIndexPage() {
  const { cookieHeader } = await requireAdminLoketUser();
  const result = await getAdminLoketLokets(cookieHeader);

  if (result.kind === "unauthorized") redirect("/401");
  if (result.kind === "forbidden") redirect("/403");
  if (result.kind === "error") redirect("/500");

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Admin Loket</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Pilih Loket</h1>
      </header>

      <AppPanel className="p-6">
        {result.data.length === 0 ? (
          <p className="text-sm text-zinc-500">Belum ada loket yang di-assign ke akun ini.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {result.data.map((loket) => (
              <Link
                key={loket.id}
                href={`/dashboard/admin-loket/${loket.slug}`}
                className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 hover:bg-zinc-50"
              >
                <p className="text-xs uppercase tracking-wide text-zinc-500">{loket.code}</p>
                <p className="mt-1 font-semibold text-zinc-900">{loket.name}</p>
                <p className="mt-1 text-sm text-zinc-600">{loket.room_name ?? "-"}</p>
              </Link>
            ))}
          </div>
        )}
      </AppPanel>
    </div>
  );
}
