import { StatusPageLayout } from "@/lib/status-page";

export default function ForbiddenPage() {
  return (
    <StatusPageLayout
      code="403 Forbidden"
      title="Akses ditolak"
      description="Akun kamu tidak memiliki izin untuk membuka halaman ini."
      badgeClassName="border border-rose-300 bg-rose-100 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200"
      actions={[
        { href: "/", label: "Kembali ke Home", variant: "primary" },

        // Uncomment the following line if you want to provide a link to the dashboard or another page
        // { href: "/", label: "Home", variant: "outline" },
      ]}
    />
  );
}
