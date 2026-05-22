"use client";

import { NavMenuType } from "@/types/NavMenuTypes";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Package,
  Receipt,
  Users,
} from "lucide-react";
import { Button } from "../../ui/Button";
import { useStoreNavigation } from "@/hooks/store-navigation";

const menuItems: NavMenuType[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    basePath: "/dashboard",
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
];

export const SideNavMenu = () => {
  return (
    <ul className="space-y-1">
      {menuItems.map((item) => (
        <NavMenuItem key={item.id} item={item} />
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
}: {
  item: NavMenuType;
  onClick?: () => void;
}) => {
  const { storeId } = useStoreNavigation();

  const pathname = usePathname();
  const router = useRouter();

  const Icon = item.icon;

  const targetUrl = `/stores/${storeId}${item.basePath}`;
  const isActive = isRouteActive(pathname, targetUrl);

  const handleButtonClick = () => {
    router.push(targetUrl);
  };

  return (
    <li>
      <Button
        variant="nav"
        onClick={onClick || handleButtonClick}
        className={`w-full gap-3 ${
          isActive
            ? "bg-indigo-100 text-indigo-600"
            : "text-gray-700 hover:bg-gray-200"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span>{item.label}</span>
      </Button>
    </li>
  );
};
