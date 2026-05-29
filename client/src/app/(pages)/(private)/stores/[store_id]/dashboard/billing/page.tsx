import type { Metadata } from "next";
import { StorePageContainer } from "@/components/ui/PageContainer";
import { BillingAnalyticsPageContent } from "@/components/modules/dashboard/FocusedAnalyticsPages";

export const metadata: Metadata = {
  title: "Billing Analytics",
  description: "Review invoice, payment, and due collection analytics.",
};

export default function BillingAnalyticsPage() {
  return (
    <StorePageContainer>
      <BillingAnalyticsPageContent />
    </StorePageContainer>
  );
}
