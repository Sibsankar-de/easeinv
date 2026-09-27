import type { Metadata } from "next";
import { HeaderNavbar, Sidebar } from "@/components/modules/navbar/Navbar";
import { StoreContentProvider } from "@/components/modules/store/StoreContentProvider";
import { StoreContextProvider } from "@/components/modules/store/storeContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import React from "react";

export const metadata: Metadata = {
  title: {
    default: "Store Dashboard",
    template: "%s | EaseInv",
  },
  description:
    "Manage invoices, products, customers, and store settings from your EaseInv business store dashboard.",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreContextProvider>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <HeaderNavbar showLogo={false} showMobileMenu={true} />
            <main className="flex-1 overflow-y-auto">
              <StoreContentProvider>{children}</StoreContentProvider>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </StoreContextProvider>
  );
}
