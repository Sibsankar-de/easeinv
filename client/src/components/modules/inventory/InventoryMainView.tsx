"use client";

import { useState } from "react";
import { Package, FolderTree } from "lucide-react";
import { Tabs, TabContent, TabItem } from "@/components/ui/Tabs";
import { cn } from "@/components/utils";
import { InventoryProductList } from "./InventoryProductList";
import { InventoryCategoryList } from "./InventoryCategoryList";

const inventoryTabs: TabItem[] = [
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: FolderTree },
];

export function InventoryMainView() {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div>
      {/* Top Header */}
      <div className={cn("mb-8")}>
        <h1 className={cn("text-gray-900 mb-2")}>My Inventory</h1>
        <p className={cn("text-gray-600")}>
          Manage your product catalog, categories, and stock pricing
        </p>
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
