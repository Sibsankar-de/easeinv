import type { Metadata } from "next";
import { CouponForm } from "@/components/modules/coupons/CouponForm";
import { StorePageContainer } from "@/components/ui/PageContainer";
import React from "react";

export const metadata: Metadata = {
  title: "Edit Coupon",
  description:
    "Update discount rules, limits, and category settings for an existing coupon.",
};

export default function CouponEditPage() {
  return (
    <StorePageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-gray-900 mb-2">Edit Coupon</h1>
              <p className="text-gray-600">
                Update coupon rules and applicability.
              </p>
            </div>
          </div>
        </div>
        <CouponForm formFor="edit" />
      </div>
    </StorePageContainer>
  );
}
