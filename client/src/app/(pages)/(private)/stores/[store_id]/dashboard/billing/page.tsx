import type { Metadata } from "next";
import { PageContainer } from "@/components/ui/PageContainer";
import { BillingAnalyticsPageContent } from "@/components/modules/dashboard/FocusedAnalyticsPages";

export const metadata: Metadata = {
  title: "Billing Analytics",
  description: "Review invoice, payment, and due collection analytics.",
};

export default function BillingAnalyticsPage() {
  return (
    <PageContainer>
      <BillingAnalyticsPageContent />
    </PageContainer>
  );
}
