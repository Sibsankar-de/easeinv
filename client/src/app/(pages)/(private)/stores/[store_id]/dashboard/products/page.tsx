import type { Metadata } from "next";
import { PageContainer } from "@/components/ui/PageContainer";
import { ProductAnalyticsPageContent } from "@/components/modules/dashboard/FocusedAnalyticsPages";

export const metadata: Metadata = {
  title: "Product Analytics",
  description: "Review product sales, category movement, and inventory analytics.",
};

export default function ProductAnalyticsPage() {
  return (
    <PageContainer>
      <ProductAnalyticsPageContent />
    </PageContainer>
  );
}
