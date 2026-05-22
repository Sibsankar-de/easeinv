import type { Metadata } from "next";
import { InventorySettingsComponent } from "@/components/modules/settings/InventorySettingsComponent";
import { PageContainer } from "@/components/ui/PageContainer";
import { Package } from "lucide-react";

export const metadata: Metadata = {
  title: "Inventory Settings",
  description:
    "Adjust inventory behavior, stock tracking preferences, and related store configuration.",
};

export default function InventorySettings() {
  return (
    <PageContainer>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Package className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-gray-900">Inventory Settings</h2>
          <p className="text-sm text-gray-600">
            Configure stock tracking and others
          </p>
        </div>
      </div>

      <InventorySettingsComponent />
    </PageContainer>
  );
}
