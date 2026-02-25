import { redirect } from "next/navigation";
import AdminLoketClient from "./AdminLoketClient";
import { requireAdminLoketUser } from "@/lib/server-auth";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AdminLoketPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await requireAdminLoketUser();

  if (!result.user) {
    redirect("/401");
  }

  return <AdminLoketClient slug={slug} />;
}
