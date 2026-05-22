import type { Metadata } from "next";
import { PageContainer } from "@/components/ui/PageContainer";
import { SalesAnalyticsPageContent } from "@/components/modules/dashboard/FocusedAnalyticsPages";

export const metadata: Metadata = {
  title: "Sales Analytics",
  description: "Review detailed revenue, profit, and sales trend analytics.",
};

export default function SalesAnalyticsPage() {
  return (
    <PageContainer>
      <SalesAnalyticsPageContent />
    </PageContainer>
  );
}
