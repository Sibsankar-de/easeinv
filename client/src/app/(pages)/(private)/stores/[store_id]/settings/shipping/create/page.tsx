import type { Metadata } from "next";
import { ShippingProfileForm } from "@/components/modules/settings/shipping/ShippingProfileForm";
import { StorePageContainer } from "@/components/ui/PageContainer";

export const metadata: Metadata = {
  title: "Create Shipping Profile",
  description: "Create a new shipping profile for delivery rate calculations.",
};

export default function CreateShippingProfilePage() {
  return (
    <StorePageContainer>
      <div className="max-w-4xl mx-auto">
        <ShippingProfileForm />
      </div>
    </StorePageContainer>
  );
}
