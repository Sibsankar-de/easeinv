import type { Metadata } from "next";
import { StorePageContainer } from "@/components/ui/PageContainer";
import { CategoryAnalyticsPageContent } from "@/components/modules/dashboard/FocusedAnalyticsPages";

export const metadata: Metadata = {
  title: "Category Analytics",
  description:
    "Review revenue, profit, and product count analytics broken down by category.",
};

export default function CategoryAnalyticsPage() {
  return (
    <StorePageContainer>
      <CategoryAnalyticsPageContent />
    </StorePageContainer>
  );
}
