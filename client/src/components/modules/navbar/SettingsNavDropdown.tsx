import { Dropdown } from "../../ui/Dropdown";
import { NavMenuType } from "@/types/NavMenuTypes";
import {
  Settings,
  FileText,
  Archive,
  CreditCard,
  Lock,
  Cable,
} from "lucide-react";
import { NavMenuItem } from "./SideNavMenu";
import { cn } from "../../utils";

const menuItems: NavMenuType[] = [
  {
    id: "general",
    basePath: "/settings/general",
    label: "General",
    icon: Settings,
  },
  {
    id: "invoice",
    basePath: "/settings/invoice",
    label: "Invoice",
    icon: FileText,
  },
  {
    id: "inventory",
    basePath: "/settings/inventory",
    label: "Inventory",
    icon: Archive,
  },
  {
    id: "billing",
    basePath: "/settings/billing",
    label: "Billing",
    icon: CreditCard,
  },
  {
    id: "security-access",
    basePath: "/settings/security-access",
    label: "Security & access",
    icon: Lock,
  },
  {
    id: "api-integrations",
    basePath: "/settings/api-integrations",
    label: "API & Integrations",
    icon: Cable,
  },
];

export const SettingsNavDropdown = ({
  openState,
  onClose,
  isCollapsed = false,
}: {
  openState: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
}) => {
  return (
    <Dropdown
      className={cn(
        "border-gray-200! z-50! p-1",
        isCollapsed
          ? "w-56 left-16 bottom-0 shadow-lg"
          : "w-full bottom-0 shadow-md",
      )}
      openState={openState}
      onClose={onClose}
    >
      <ul className="space-y-1 list-none p-0 m-0">
        {menuItems.map((item) => (
          <NavMenuItem key={item.id} item={item} onClick={onClose} />
        ))}
      </ul>
    </Dropdown>
  );
};
