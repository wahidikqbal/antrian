import { redirect } from "next/navigation";
import KioskRuanganClient from "./KioskRuanganClient";
import { requireAuthUser } from "@/lib/server-auth";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function KioskRuanganPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await requireAuthUser();

  if (!result.user) {
    redirect("/401");
  }

  return <KioskRuanganClient slug={slug} />;
}
