"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Package, FolderTree } from "lucide-react";
import { Tabs, TabContent, TabItem } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/utils";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { InventoryProductList } from "./InventoryProductList";
import { InventoryCategoryList } from "./InventoryCategoryList";

const inventoryTabs: TabItem[] = [
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: FolderTree },
];

export function InventoryMainView() {
  const { storeId } = useStoreNavigation();
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div>
      {/* Top Header */}
      <div
        className={cn(
          "mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
        )}
      >
        <div>
          <h1 className={cn("text-2xl font-bold text-gray-900 mb-1")}>
            My Inventory
          </h1>
          <p className={cn("text-gray-600 text-sm")}>
            Manage your product catalog, categories, and stock pricing
          </p>
        </div>
        <div className={cn("flex items-center gap-3")}>
          <Link href={`/stores/${storeId}/inventory/add-product`}>
            <Button variant="primary" className={cn("flex items-center gap-2")}>
              <Plus className={cn("w-4 h-4")} />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs tabs={inventoryTabs} activeTab={activeTab} onChange={setActiveTab}>
        <TabContent tabId="products">
          <InventoryProductList />
        </TabContent>
        <TabContent tabId="categories">
          <InventoryCategoryList />
        </TabContent>
      </Tabs>
    </div>
  );
}
