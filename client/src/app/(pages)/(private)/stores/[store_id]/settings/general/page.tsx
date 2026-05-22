import type { Metadata } from "next";
import { StoreInfoComponent } from "@/components/modules/settings/StoreInfoComponent";
import { PageContainer } from "@/components/ui/PageContainer";
import { Store } from "lucide-react";

export const metadata: Metadata = {
  title: "General Settings",
  description:
    "Update store information, contact details, and business identity settings for this workspace.",
};

export default function GeneralSettings() {
  return (
    <PageContainer>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Store className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-gray-900">Store Information</h2>
          <p className="text-sm text-gray-600">
            Update your store details and contact information
          </p>
        </div>
      </div>

      <StoreInfoComponent />
    </PageContainer>
  );
}
