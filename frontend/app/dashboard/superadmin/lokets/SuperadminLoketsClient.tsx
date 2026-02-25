"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getCsrfHeaders } from "@/lib/csrf";
import { type SuperadminLoket } from "@/lib/api-loket-queue";
import { AppPanel } from "@/lib/ui";

type SuperadminLoketsClientProps = {
  initialLokets: SuperadminLoket[];
};

export default function SuperadminLoketsClient({ initialLokets }: SuperadminLoketsClientProps) {
  const [lokets, setLokets] = useState(initialLokets);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", code: "", room_name: "" });

  const refresh = async () => {
    const response = await fetch("/api/superadmin/lokets", {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return;
    const payload = (await response.json()) as SuperadminLoket[];
    setLokets(payload);
  };

  const createLoket = async () => {
    setLoading(true);
    setMessage("");
    try {
      await getCsrfHeaders();
      const response = await fetch("/api/superadmin/lokets", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, is_active: true }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(payload.message ?? "Gagal membuat loket.");
        return;
      }
      setForm({ name: "", slug: "", code: "", room_name: "" });
      await refresh();
      setMessage("Loket berhasil dibuat.");
    } catch {
      setMessage("Gangguan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  const deleteLoket = async (id: number) => {
    setLoading(true);
    setMessage("");
    try {
      await getCsrfHeaders();
      const response = await fetch(`/api/superadmin/lokets/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(payload.message ?? "Gagal hapus loket.");
        return;
      }
      await refresh();
      setMessage("Loket dihapus.");
    } catch {
      setMessage("Gangguan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Superadmin</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Master Loket</h1>
      </header>

      <AppPanel className="p-6">
        <h2 className="text-base font-semibold text-zinc-900">Tambah Loket</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            placeholder="Nama loket"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            placeholder="Slug (dokter-gigi)"
            value={form.slug}
            onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
          />
          <input
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            placeholder="Kode (DG)"
            value={form.code}
            onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
          />
          <input
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            placeholder="Ruangan"
            value={form.room_name}
            onChange={(event) => setForm((prev) => ({ ...prev, room_name: event.target.value }))}
          />
        </div>
        <Button type="button" className="mt-4" onClick={createLoket} disabled={loading}>
          Simpan Loket
        </Button>
      </AppPanel>

      <AppPanel className="mt-6 p-6">
        <h2 className="text-base font-semibold text-zinc-900">Daftar Loket</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-xl border border-zinc-200">
            <thead className="bg-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-3 py-2">Nama</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Kode</th>
                <th className="px-3 py-2">Admin Loket</th>
                <th className="px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white text-sm text-zinc-700">
              {lokets.map((item, index) => (
                <tr key={item.id} className={index < lokets.length - 1 ? "border-b border-zinc-100" : ""}>
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2">{item.slug}</td>
                  <td className="px-3 py-2">{item.code}</td>
                  <td className="px-3 py-2">{item.admins.map((admin) => admin.email).join(", ") || "-"}</td>
                  <td className="px-3 py-2">
                    <Button type="button" variant="destructive" size="sm" onClick={() => void deleteLoket(item.id)} disabled={loading}>
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AppPanel>

      {message ? (
        <p className="mt-6 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
          {message}
        </p>
      ) : null}
    </div>
  );
}
