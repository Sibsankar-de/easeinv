import type { Metadata } from "next";
import { OrderDetailsView } from "@/components/modules/orders/OrderDetailsView";
import { StorePageContainer } from "@/components/ui/PageContainer";

export const metadata: Metadata = {
  title: "Order Details",
  description:
    "View full order details, tracking information, and customer invoice.",
};

export default function OrderDetailsPage() {
  return (
    <StorePageContainer>
      <OrderDetailsView />
    </StorePageContainer>
  );
}
