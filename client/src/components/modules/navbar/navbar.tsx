"use client";

import { Settings, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { NavMenuType } from "@/types/NavMenuTypes";
import { useSelector } from "react-redux";
import { selectUserSate } from "@/store/features/userSlice";
import { Avatar } from "../../ui/Avatar";
import { ProfileDropdown } from "./ProfileDropdown";
import { useState } from "react";
import { AppLogoFull } from "../../ui/AppLogo";
import { NavbarSearch } from "./NavbarSearch";
import { useRouter } from "next/navigation";
import { Button, ButtonType } from "../../ui/Button";
import { cn } from "../../utils";
import { useNavContext } from "@/contexts/NavContext";
import { NavMenuItem, SideNavMenu } from "./SideNavMenu";
import { SettingsNavDropdown } from "./SettingsNavDropdown";

const settingsItem: NavMenuType = {
  id: "settings",
  label: "Settings",
  basePath: "/settings",
  icon: Settings,
};

export function Sidebar() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <nav className="flex-1 p-4">
        <SideNavMenu />
      </nav>

      <div className="p-4 border-t border-gray-200">
        <ul className="relative">
          <SettingsNavDropdown
            openState={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />
          <NavMenuItem
            item={settingsItem}
            onClick={() => setSettingsOpen((p) => !p)}
          />
        </ul>
      </div>
    </aside>
  );
}

export function HeaderNavbar() {
  const { data: user } = useSelector(selectUserSate);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();
  const { actionButtons } = useNavContext();

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-2 sticky top-0 z-50 h-fit">
      <div className="flex items-center justify-between">
        <AppLogoFull size={120} />

        <div className="flex-1 max-w-2xl flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="p-2"
              tooltip="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => router.forward()}
              variant="outline"
              className="p-2"
              tooltip="Go forward"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <NavbarSearch />

          {actionButtons}
        </div>

        <div className="flex items-center gap-4 ml-8">
          <Button
            variant="none"
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          <div className="border-l border-gray-200 pl-1">
            <div
              className={cn(
                "flex items-center gap-3 pl-4",
                "hover:bg-gray-100 rounded-xl py-1.5 px-2 cursor-pointer active:bg-gray-300 transition-all duration-200",
                "select-none",
              )}
              onClick={() => setIsProfileOpen((p) => !p)}
            >
              <div className="text-right">
                <p className="text-gray-900">{user?.userName}</p>
                <p className="text-xs text-gray-500">Member</p>
              </div>
              <Avatar size={40} />
            </div>
            <ProfileDropdown
              openState={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export const NavActionButton = ({ ...props }: ButtonType) => {
  return (
    <Button
      variant="dark"
      className={cn("text-sm", props.className)}
      {...props}
    >
      {props.children}
    </Button>
  );
};
