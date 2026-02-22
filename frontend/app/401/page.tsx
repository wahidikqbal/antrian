import { StatusPageLayout } from "@/lib/status-page";

export default function UnauthorizedPage() {
  return (
    <StatusPageLayout
      code="401 Unauthorized"
      title="Kamu belum login"
      description="Silakan login terlebih dahulu untuk mengakses halaman ini."
      badgeClassName="border border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200"
      actions={[
        { href: "/login", label: "Ke Login", variant: "primary" },
        { href: "/", label: "Home", variant: "outline" },
      ]}
    />
  );
}
