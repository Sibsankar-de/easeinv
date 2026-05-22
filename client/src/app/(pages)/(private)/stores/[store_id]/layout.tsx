import type { Metadata } from "next";
import { HeaderNavbar, Sidebar } from "@/components/modules/navbar/navbar";
import { StoreContentProvider } from "@/components/modules/store/StoreContentProvider";
import { StoreContextProvider } from "@/components/modules/store/storeContext";
import React from "react";

export const metadata: Metadata = {
  title: {
    default: "Store Workspace",
    template: "%s | EaseInv",
  },
  description:
    "Manage invoices, products, customers, and store settings from your EaseInv business workspace.",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreContextProvider>
      <div className="flex flex-col h-screen">
        <HeaderNavbar />
        <div className="flex-1 flex overflow-hidden h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <StoreContentProvider>{children}</StoreContentProvider>
          </main>
        </div>
      </div>
    </StoreContextProvider>
  );
}
