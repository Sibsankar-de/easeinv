import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { StorePageContainer } from "@/components/ui/PageContainer";
import React from "react";
import { ProductForm } from "@/components/modules/inventory/ProductForm";

export const metadata: Metadata = {
  title: "Add Product",
  description:
    "Add a new product to your store inventory with pricing, stock, and category details.",
};

export default function AddProductPage() {
  return (
    <StorePageContainer>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-gray-900 mb-1">Add new product</h1>
            <p className="text-gray-600">Add new product in your inventory.</p>
          </div>
        </div>
      </div>
      <ProductForm formFor="create" />
    </StorePageContainer>
  );
}
