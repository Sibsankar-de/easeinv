import type { Metadata } from "next";
import { OrderListTable } from "@/components/modules/orders/OrderListTable";
import { StorePageContainer } from "@/components/ui/PageContainer";

export const metadata: Metadata = {
  title: "Orders",
  description:
    "Track order lifecycle states, manage customer orders, dispatch delivery details, and inspect order details.",
};

export default function OrdersPage() {
  return (
    <StorePageContainer>
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2 font-bold text-2xl">Orders</h1>
        <p className="text-gray-600">Track and manage customer orders and fulfillment</p>
      </div>

      <div className="space-y-6">
        <OrderListTable />
      </div>
    </StorePageContainer>
  );
}
