"use client";

import Link from "next/link";
import { NavMenuType } from "@/types/NavMenuTypes";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Package,
  Receipt,
  Users,
  Ticket,
  ShoppingBag,
} from "lucide-react";
import { Button } from "../../ui/Button";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { cn } from "../../utils";

const menuItems: NavMenuType[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    basePath: "/dashboard",
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingBag,
    basePath: "/orders",
  },
  {
    id: "billing",
    label: "Create Bill",
    icon: Receipt,
    basePath: "/billing",
  },
  {
    id: "invoices",
    label: "Invoices",
    icon: FileText,
    basePath: "/invoices",
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
    basePath: "/customers",
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    basePath: "/inventory",
  },
  {
    id: "coupons",
    label: "Coupons",
    icon: Ticket,
    basePath: "/coupons",
  },
];

export const SideNavMenu = ({ isCollapsed }: { isCollapsed?: boolean }) => {
  return (
    <ul className="space-y-1 list-none p-0 m-0">
      {menuItems.map((item) => (
        <NavMenuItem key={item.id} item={item} isCollapsed={isCollapsed} />
      ))}
    </ul>
  );
};

const isRouteActive = (currentPath: string, targetPath: string) => {
  if (currentPath === targetPath) return true;
  if (currentPath.startsWith(`${targetPath}/`)) return true;

  return false;
};

export const NavMenuItem = ({
  item,
  onClick,
  isCollapsed = false,
}: {
  item: NavMenuType;
  onClick?: () => void;
  isCollapsed?: boolean;
}) => {
  const { storeId } = useStoreNavigation();
  const pathname = usePathname();

  const Icon = item.icon;

  const targetUrl = `/stores/${storeId}${item.basePath}`;
  const isActive = isRouteActive(pathname, targetUrl);

  const navButton = (
    <Button
      variant="nav"
      onClick={onClick}
      tooltip={isCollapsed ? item.label : undefined}
      tooltipId={`nav-tooltip-${item.id}`}
      className={cn(
        "w-full transition-all duration-200",
        isCollapsed
          ? "justify-center px-2 py-2.5 gap-0"
          : "justify-start px-3 py-2 gap-3",
        isActive
          ? "bg-indigo-100 text-primary font-medium"
          : "text-gray-700 hover:bg-gray-100",
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      {!isCollapsed && <span className="truncate">{item.label}</span>}
    </Button>
  );

  return (
    <li className="list-none">
      {item.id === "settings" ? (
        navButton
      ) : (
        <Link href={targetUrl} className="block w-full">
          {navButton}
        </Link>
      )}
    </li>
  );
};
