import type { Metadata } from "next";
import { InvoiceListTable } from "@/components/modules/invoices/InvoiceListTable";
import { InvoiceSummarySection } from "@/components/modules/invoices/InvoiceSummarySection";
import { StorePageContainer } from "@/components/ui/PageContainer";

export const metadata: Metadata = {
  title: "Invoices",
  description:
    "Track invoice status, monitor summaries, and manage the full invoice history for your store.",
};

export default function InvoicesPage() {
  return (
    <StorePageContainer>
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Invoices</h1>
        <p className="text-gray-600">View and manage all your invoices</p>
      </div>

      <div className="space-y-6">
        <InvoiceSummarySection />

        <InvoiceListTable />
      </div>
    </StorePageContainer>
  );
}
