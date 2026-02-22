import { StatusPageLayout } from "@/lib/status-page";

export default function InternalServerErrorPage() {
  return (
    <StatusPageLayout
      code="500 Error"
      title="Terjadi kesalahan server"
      description="Coba muat ulang halaman atau kembali beberapa saat lagi."
      badgeClassName="border border-indigo-300 bg-indigo-100 text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-indigo-200"
      actions={[
        { href: "/dashboard/users", label: "Coba Lagi", variant: "primary" },
        { href: "/", label: "Home", variant: "outline" },
      ]}
    />
  );
}
