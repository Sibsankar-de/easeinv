import { redirect } from "next/navigation";

export default async function StoreHome({
  params,
}: {
  params: Record<string, any>;
}) {
  const { store_id } = await params;
  redirect(`/stores/${store_id}/dashboard`);
}
