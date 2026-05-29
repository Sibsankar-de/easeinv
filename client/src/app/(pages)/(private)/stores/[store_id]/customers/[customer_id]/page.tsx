import { CustomerDetailsView } from "@/components/modules/customers/CustomerDetailsView";
import { StorePageContainer } from "@/components/ui/PageContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Details",
  description: "View detailed customer information and invoice history.",
};

export default function CustomerDetailsPage() {
  return (
    <StorePageContainer>
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Customer Details</h1>
        <p className="text-gray-600">
          View customer profile and recent billing activity
        </p>
      </div>

      <CustomerDetailsView />
    </StorePageContainer>
  );
}
