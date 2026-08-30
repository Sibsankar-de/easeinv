"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../utils";
import { Button } from "../../ui/Button";
import { SpreadText } from "../../ui/SpreadText";
import { AppLogo, AppLogoFull } from "../../ui/AppLogo";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  BookOpen,
  Key,
  Terminal,
  Package,
  Receipt,
  Users,
  ShoppingBag,
  Truck,
  ShieldCheck,
  HelpCircle,
  PanelLeft,
} from "lucide-react";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

const navigationGroups: SidebarGroup[] = [
  {
    title: "Getting Started",
    items: [
      {
        title: "Introduction",
        href: "/docs/introduction",
        icon: BookOpen,
      },
    ],
  },
  {
    title: "User Guides",
    items: [
      {
        title: "Inventory Management",
        href: "/docs/inventory",
        icon: Package,
      },
      {
        title: "Billing & Invoices",
        href: "/docs/billing",
        icon: Receipt,
      },
      {
        title: "Customer Management",
        href: "/docs/customers",
        icon: Users,
      },
      {
        title: "Order Management",
        href: "/docs/orders",
        icon: ShoppingBag,
      },
      {
        title: "Shipping & Delivery",
        href: "/docs/shipping",
        icon: Truck,
      },
      {
        title: "Access Control",
        href: "/docs/access-control",
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: "Developer Reference",
    items: [
      {
        title: "API Authentication",
        href: "/docs/authentication",
        icon: Key,
      },
      {
        title: "API Explorer",
        href: "/docs/api",
        icon: Terminal,
      },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-white border-r border-border shrink-0 h-full",
        "transition-all duration-300 relative select-none",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Top Sidebar Header with AppLogo & PanelLeft Toggle Icon */}
      <div
        className={cn(
          "p-3 border-b border-gray-100 flex items-center min-h-[57px]",
          isCollapsed ? "justify-center" : "justify-between",
        )}
      >
        {!isCollapsed ? (
          <>
            <Link href="/" className="inline-flex items-center">
              <AppLogoFull size={115} />
            </Link>
            <Button
              variant="none"
              onClick={toggleCollapsed}
              className={cn(
                "p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100",
                "rounded-lg transition-colors",
              )}
              tooltip="Collapse sidebar"
              tooltipId="docs-sidebar-toggle-tooltip"
            >
              <PanelLeft className="w-5 h-5 flex-shrink-0" />
            </Button>
          </>
        ) : (
          <Button
            variant="none"
            onClick={toggleCollapsed}
            className={cn(
              "relative group p-1.5 text-gray-600 hover:bg-gray-100",
              "rounded-lg flex items-center justify-center transition-colors",
            )}
            tooltip="Expand sidebar"
            tooltipId="docs-sidebar-toggle-tooltip"
          >
            <AppLogo
              size={32}
              className="group-hover:opacity-0 transition-opacity duration-200"
            />
            <PanelLeft
              className={cn(
                "w-5 h-5 text-gray-700 absolute opacity-0",
                "group-hover:opacity-100 transition-opacity duration-200",
              )}
            />
          </Button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-6 overflow-y-auto overflow-x-hidden">
        {navigationGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!isCollapsed && (
              <SpreadText
                as="h4"
                className="text-[10px] text-gray-400 px-3 mb-2 uppercase tracking-wider"
              >
                {group.title}
              </SpreadText>
            )}
            <ul className="space-y-1 list-none p-0 m-0">
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={itemIdx} className="list-none">
                    <Link href={item.href} className="block w-full">
                      <Button
                        variant="nav"
                        tooltip={isCollapsed ? item.title : undefined}
                        tooltipId={`docs-nav-tooltip-${item.href}`}
                        className={cn(
                          "w-full transition-all duration-200 font-medium",
                          isCollapsed
                            ? "justify-center px-2 py-2.5 gap-0"
                            : "justify-start px-3 py-2 gap-3 text-left",
                          isActive
                            ? "bg-indigo-100 text-primary font-medium"
                            : "text-gray-700 hover:bg-gray-100",
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-5 h-5 shrink-0",
                            isActive ? "text-primary" : "text-gray-500",
                          )}
                        />
                        {!isCollapsed && (
                          <span className="truncate">{item.title}</span>
                        )}
                      </Button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom exit area matching settings block */}
      <div className="p-3 border-t border-gray-200">
        <Link href="/" className="block w-full">
          <Button
            variant="nav"
            tooltip={isCollapsed ? "Exit to Home" : undefined}
            tooltipId="docs-exit-home-tooltip"
            className={cn(
              "w-full transition-all duration-200 text-gray-700 hover:bg-gray-100",
              isCollapsed
                ? "justify-center px-2 py-2.5 gap-0"
                : "justify-start px-3 py-2 gap-3 text-left",
            )}
          >
            <HelpCircle className="w-5 h-5 text-gray-500 shrink-0" />
            {!isCollapsed && <span className="truncate">Exit to Home</span>}
          </Button>
        </Link>
      </div>
    </aside>
  );
}
