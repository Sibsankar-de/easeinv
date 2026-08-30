import type { Metadata } from "next";
import { ShippingProfileListTable } from "@/components/modules/settings/shipping/ShippingProfileListTable";
import { StorePageContainer } from "@/components/ui/PageContainer";
import { Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Settings",
  description:
    "Manage shipping profiles, delivery zones, custom rates, and shipping policies for your store.",
};

export default function ShippingSettingsPage() {
  return (
    <StorePageContainer>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Truck className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-gray-900 font-bold text-xl">Shipping Profiles</h2>
          <p className="text-sm text-gray-600">
            Configure delivery zones, postal codes, and custom shipping rate
            brackets for orders.
          </p>
        </div>
      </div>

      <ShippingProfileListTable />
    </StorePageContainer>
  );
}
