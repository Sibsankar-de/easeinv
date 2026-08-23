import type { Metadata } from "next";
import { StorePageContainer } from "@/components/ui/PageContainer";
import { CouponForm } from "@/components/modules/coupons/CouponForm";

export const metadata: Metadata = {
  title: "Create Coupon",
  description:
    "Create a new discount coupon with custom rules, discount rates, and category restrictions.",
};

export default function AddCouponPage() {
  return (
    <StorePageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-gray-900 mb-1">Create Coupon</h1>
              <p className="text-gray-600">
                Add a new promotional coupon code for your store.
              </p>
            </div>
          </div>
        </div>
        <CouponForm formFor="create" />
      </div>
    </StorePageContainer>
  );
}
