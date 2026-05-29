import type { Metadata } from "next";
import { StorePageContainer } from "@/components/ui/PageContainer";
import { ProductAnalyticsPageContent } from "@/components/modules/dashboard/FocusedAnalyticsPages";

export const metadata: Metadata = {
  title: "Product Analytics",
  description: "Review product sales, category movement, and inventory analytics.",
};

export default function ProductAnalyticsPage() {
  return (
    <StorePageContainer>
      <ProductAnalyticsPageContent />
    </StorePageContainer>
  );
}
