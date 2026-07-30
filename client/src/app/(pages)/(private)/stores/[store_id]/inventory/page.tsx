import type { Metadata } from "next";
import { StorePageContainer } from "@/components/ui/PageContainer";
import { InventoryMainView } from "@/components/modules/inventory/InventoryMainView";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Manage your product catalog, categories, pricing, and stock details for this store.",
};

export default async function ProductsPage({
  params,
}: {
  params: Record<string, any>;
}) {
  return (
    <StorePageContainer>
      <InventoryMainView />
    </StorePageContainer>
  );
}
