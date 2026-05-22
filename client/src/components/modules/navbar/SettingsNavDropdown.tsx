import { Dropdown } from "../../ui/Dropdown";
import { NavMenuType } from "@/types/NavMenuTypes";
import { Settings, FileText, Archive, CreditCard, Lock } from "lucide-react";
import { NavMenuItem } from "./SideNavMenu";

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
    id: "access-control",
    basePath: "/settings/access-control",
    label: "Access Control",
    icon: Lock,
  },
];

export const SettingsNavDropdown = ({
  openState,
  onClose,
}: {
  openState: boolean;
  onClose: () => void;
}) => {
  return (
    <Dropdown
      className="w-full bottom-0 border-gray-200! shadow-md z-50! space-y-1"
      openState={openState}
      onClose={onClose}
    >
      {menuItems.map((item) => (
        <NavMenuItem key={item.id} item={item} />
      ))}
    </Dropdown>
  );
};
