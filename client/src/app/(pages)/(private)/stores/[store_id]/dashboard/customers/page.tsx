import type { Metadata } from "next";
import { StorePageContainer } from "@/components/ui/PageContainer";
import { CustomerAnalyticsPageContent } from "@/components/modules/dashboard/FocusedAnalyticsPages";

export const metadata: Metadata = {
  title: "Customer Analytics",
  description: "Review customer billing behavior and payment analytics.",
};

export default function CustomerAnalyticsPage() {
  return (
    <StorePageContainer>
      <CustomerAnalyticsPageContent />
    </StorePageContainer>
  );
}
