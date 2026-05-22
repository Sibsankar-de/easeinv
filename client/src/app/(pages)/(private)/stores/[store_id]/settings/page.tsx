import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Store Settings",
  description:
    "Manage store information, invoice preferences, and inventory-related settings for your business.",
};

export default async function page({
  params,
}: {
  params: Record<string, any>;
}) {
  const { store_id } = await params;
  redirect(`/stores/${store_id}/settings/general`);
}
