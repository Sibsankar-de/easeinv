import type { Metadata } from "next";
import { ShippingProfileForm } from "@/components/modules/settings/shipping/ShippingProfileForm";
import { StorePageContainer } from "@/components/ui/PageContainer";

export const metadata: Metadata = {
  title: "Edit Shipping Profile",
  description: "Update shipping profile name, status, and description.",
};

export default function EditShippingProfilePage() {
  return (
    <StorePageContainer>
      <div className="max-w-4xl mx-auto">
        <ShippingProfileForm isEditing={true} />
      </div>
    </StorePageContainer>
  );
}
