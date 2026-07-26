"use client";

import React from "react";
import { HeaderNavbar } from "@/components/modules/navbar/Navbar";
import { DocsSidebar } from "../modules/docs/DocsSidebar";
import { DocsMobileNav } from "../modules/docs/DocsMobileNav";
import {
  BookOpen,
  Key,
  Terminal,
  Package,
  Receipt,
  Users,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { cn } from "../utils";

interface DocPageInfo {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
}

const docNavigationOrder: Record<string, DocPageInfo> = {
  "/docs/introduction": {
    title: "Inventory Management",
    description: "Learn how to manage products, units, and stock tracking.",
    href: "/docs/inventory",
    icon: Package,
  },
  "/docs/inventory": {
    title: "Billing & Invoices",
    description:
      "Learn how to draft invoices, print bills, and configure customizations.",
    href: "/docs/billing",
    icon: Receipt,
  },
  "/docs/billing": {
    title: "Customer Management",
    description: "Learn how to manage customer ledger, dues, and directories.",
    href: "/docs/customers",
    icon: Users,
  },
  "/docs/customers": {
    title: "API Authentication",
    description: "Configure secret API Keys to integrate third-party tools.",
    href: "/docs/authentication",
    icon: Key,
  },
  "/docs/authentication": {
    title: "API Explorer Sandbox",
    description:
      "Interactively test and inspect API endpoints in your browser.",
    href: "/docs/api",
    icon: Terminal,
  },
  "/docs/api": {
    title: "Back to Onboarding",
    description: "Review the onboarding guide and system overview.",
    href: "/docs/introduction",
    icon: BookOpen,
  },
};

export function DocPageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const nextPage = docNavigationOrder[pathname];
  const isApiExplorer = pathname === "/docs/api";

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderNavbar />

      <div className="flex-1 flex flex-row">
        <div className="hidden md:block sticky top-[57px] h-[calc(100vh-69px)] shrink-0 z-20">
          <DocsSidebar />
        </div>

        {/* Mobile Navigation Drawer */}
        <DocsMobileNav />

        <main className="flex-1 min-w-0 flex flex-col justify-between">
          <div
            className={cn(
              "px-6 pb-8 md:px-12 md:pb-10 flex-1 w-full mx-auto space-y-8",
              isApiExplorer ? "max-w-[1400px]" : "max-w-5xl",
            )}
          >
            <div>{children}</div>

            {nextPage && (
              <div className="pt-8 border-t border-border flex justify-end">
                <Link
                  href={nextPage.href}
                  className={cn(
                    "group flex items-center gap-1.5",
                    "text-sm font-semibold text-primary hover:text-indigo-700 transition-colors",
                  )}
                >
                  <span>Read Next: {nextPage.title}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
