import type { ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "outline" | "danger";

function classes(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

function variantClass(variant: Variant) {
  switch (variant) {
    case "primary":
      return "bg-zinc-900 text-white hover:bg-zinc-700";
    case "secondary":
      return "bg-zinc-100 text-zinc-800 hover:bg-zinc-200";
    case "danger":
      return "bg-red-600 text-white hover:bg-red-500";
    case "outline":
    default:
      return "border border-zinc-300 text-zinc-700 hover:bg-zinc-100";
  }
}

type ActionProps = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
};

export function AppLinkButton({
  href,
  children,
  className,
  variant = "outline",
}: ActionProps & { href: string }) {
  return (
    <Link
      href={href}
      className={classes(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors",
        variantClass(variant),
        className
      )}
    >
      {children}
    </Link>
  );
}

export function AppAnchorButton({
  href,
  children,
  className,
  variant = "outline",
}: ActionProps & { href: string }) {
  return (
    <a
      href={href}
      className={classes(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors",
        variantClass(variant),
        className
      )}
    >
      {children}
    </a>
  );
}

export function AppPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={classes(
        "rounded-2xl border border-zinc-200 bg-white shadow-sm",
        className
      )}
    >
      {children}
    </section>
  );
}

export function InfoTile({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-2 text-sm font-medium text-zinc-900">{value}</dd>
    </div>
  );
}
