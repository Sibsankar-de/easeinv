import type { Metadata } from "next";
import { ShippingProfileDetailsView } from "@/components/modules/settings/shipping/ShippingProfileDetailsView";
import { StorePageContainer } from "@/components/ui/PageContainer";

export const metadata: Metadata = {
  title: "Manage Shipping Profile",
  description:
    "Manage delivery zones, postal codes, and custom rate rules for this shipping profile.",
};

export default function ManageShippingProfilePage() {
  return (
    <StorePageContainer>
      <div className="max-w-5xl mx-auto">
        <ShippingProfileDetailsView />
      </div>
    </StorePageContainer>
  );
}
