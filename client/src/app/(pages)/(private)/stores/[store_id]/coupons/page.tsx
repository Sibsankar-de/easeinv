import type { Metadata } from "next";
import { CouponListTable } from "@/components/modules/coupons/CouponListTable";
import { StorePageContainer } from "@/components/ui/PageContainer";

export const metadata: Metadata = {
  title: "Coupons",
  description:
    "View, create, and manage discount coupons and promotional offers for your store.",
};

export default function CouponsPage() {
  return (
    <StorePageContainer>
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Coupons & Discounts</h1>
        <p className="text-gray-600">
          Create and manage promotional discount coupons for your store.
        </p>
      </div>

      <CouponListTable />
    </StorePageContainer>
  );
}
