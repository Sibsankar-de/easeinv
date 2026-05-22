import type { Metadata } from "next";
import { CreateBillPage } from "@/components/modules/create-bill/CreateBillPage";
import { PageContainer } from "@/components/ui/PageContainer";
import React from "react";

export const metadata: Metadata = {
  title: "Create Invoice",
  description:
    "Create, review, and generate professional invoices for your customers from your store workspace.",
};

export default function BillingPage() {
  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Create New Invoice</h1>
          <p className="text-gray-600">
            Generate a professional invoice for your client
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        {/* Billing sector */}
        <CreateBillPage />
      </div>
    </PageContainer>
  );
}
