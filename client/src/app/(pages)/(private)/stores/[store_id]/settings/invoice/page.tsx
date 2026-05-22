import type { Metadata } from "next";
import { InventorySettingsComponent } from "@/components/modules/settings/InventorySettingsComponent";
import { InvoiceSettingsComponent } from "@/components/modules/settings/InvoiceSettingsComponent";
import { PageContainer } from "@/components/ui/PageContainer";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Invoice Settings",
  description:
    "Configure invoice numbering, default invoice content, and billing document preferences.",
};

export default function InvoiceSettings() {
  return (
    <PageContainer>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-gray-900">Invoice Settings</h2>
          <p className="text-sm text-gray-600">
            Configure invoice numbering and default content
          </p>
        </div>
      </div>

      <InvoiceSettingsComponent />
    </PageContainer>
  );
}
