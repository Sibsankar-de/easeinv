import type { Metadata } from "next";
import { ProductForm } from "@/components/modules/inventory/ProductForm";
import { PageContainer } from "@/components/ui/PageContainer";
import React from "react";

export const metadata: Metadata = {
  title: "Edit Product",
  description:
    "Update product information, pricing, and inventory settings for an existing item.",
};

export default function ProductEditPage() {
  return (
    <PageContainer>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-gray-900 mb-2">Edit product</h1>
          </div>
        </div>
      </div>
      <ProductForm formFor="edit" />
    </PageContainer>
  );
}
