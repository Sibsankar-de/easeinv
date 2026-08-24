"use client";

import {
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  PanelLeft,
} from "lucide-react";
import { NavMenuType } from "@/types/NavMenuTypes";
import Link from "next/link";
import { useSelector } from "react-redux";
import { selectUserSate } from "@/store/features/userSlice";
import { Avatar } from "../../ui/Avatar";
import { ProfileDropdown } from "./ProfileDropdown";
import { useEffect, useRef, useState } from "react";
import { AppLogo, AppLogoFull } from "../../ui/AppLogo";
import { useResize } from "@/contexts/ResizeContext";
import { NavbarSearch } from "./NavbarSearch";
import { useRouter } from "next/navigation";
import { Button, ButtonType } from "../../ui/Button";
import { cn } from "../../utils";
import { useNavContext } from "@/contexts/NavContext";
import { NavMenuItem, SideNavMenu } from "./SideNavMenu";
import { SettingsNavDropdown } from "./SettingsNavDropdown";
import { UserDto } from "@/types/dto/userDto";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { StoreSelector } from "./StoreSelector";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchNotificationsThunk,
  selectNotificationState,
} from "@/store/features/notificationSlice";
import { NotificationPane } from "../notifications/NotificationPane";

function NotificationBellButton() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useSelector(selectNotificationState);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    // Initial fetch on mount / login (real-time WebSockets handle subsequent updates)
    dispatch(fetchNotificationsThunk({ page: 1 }));
  }, [isAuthenticated, dispatch]);

  if (!isAuthenticated) return null;

  return (
    <>
      <Button
        variant="none"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg mx-1.5 sm:mx-2",
          "transition-colors",
        )}
        tooltip="Notifications"
        aria-label="Toggle notifications pane"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in-50 duration-200">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      <NotificationPane isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

const settingsItem: NavMenuType = {
  id: "settings",
  label: "Settings",
  basePath: "/settings",
  icon: Settings,
};

function MobileDrawer({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(isOpen);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setMounted(true);
        setActive(true);
      }, 0);
      return () => clearTimeout(timer);
    } else {
      const activeTimer = setTimeout(() => setActive(false), 0);
      const mountTimer = setTimeout(() => setMounted(false), 300);
      return () => {
        clearTimeout(activeTimer);
        clearTimeout(mountTimer);
      };
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div className="md:hidden">
      {/* Backdrop overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-40 backdrop-blur-xs",
          "transition-opacity duration-300 ease-in-out",
          active ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Slide-over Drawer panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col",
          "transition-transform duration-300 ease-in-out transform",
          active ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {children}
      </aside>
    </div>
  );
}

export function Sidebar() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    isCollapsed,
    toggleCollapsed,
    setCollapsed,
    isMobileOpen,
    closeMobile,
  } = useSidebar();
  const { md, lg } = useResize();

  const isTablet = md && !lg;
  const isTabletOverlay = isTablet && !isCollapsed;

  return (
    <>
      {/* Tablet Overlay Backdrop when opened */}
      {isTabletOverlay && (
        <div
          className="fixed inset-0 bg-black/25 z-40 backdrop-blur-[1px] md:block lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Normal flow placeholder for tablet view when expanded so page layout doesn't shift */}
      {isTabletOverlay && (
        <div className="hidden md:block lg:hidden w-16 shrink-0 h-full border-r border-transparent" />
      )}

      {/* 1. Desktop & Tablet Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-white border-r border-gray-200 select-none h-full",
          "transition-all duration-300",
          isTabletOverlay
            ? "fixed inset-y-0 left-0 z-50 w-64 shadow-2xl"
            : "relative",
          !isTabletOverlay && (isCollapsed ? "w-16" : "w-64"),
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
              <Link href="/profile" className="inline-flex items-center">
                <AppLogoFull size={115} />
              </Link>
              <Button
                variant="none"
                onClick={toggleCollapsed}
                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                tooltip="Collapse sidebar"
                tooltipId="sidebar-toggle-tooltip"
              >
                <PanelLeft className="w-5 h-5 shrink-0" />
              </Button>
            </>
          ) : (
            <Button
              variant="none"
              onClick={toggleCollapsed}
              className="relative group p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center justify-center"
              tooltip="Expand sidebar"
              tooltipId="sidebar-toggle-tooltip"
            >
              <AppLogo
                size={32}
                className="group-hover:opacity-0 transition-opacity duration-200"
              />
              <PanelLeft className="w-5 h-5 text-gray-700 absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Button>
          )}
        </div>

        <nav className="flex-1 p-3 overflow-y-auto overflow-x-hidden">
          <SideNavMenu isCollapsed={isCollapsed} />
        </nav>

        {/* Settings Footer */}
        <div className="p-3 border-t border-gray-200">
          <div className="relative">
            <SettingsNavDropdown
              openState={settingsOpen}
              onClose={() => setSettingsOpen(false)}
              isCollapsed={isCollapsed}
            />
            <NavMenuItem
              item={settingsItem}
              isCollapsed={isCollapsed}
              onClick={() => setSettingsOpen((p) => !p)}
            />
          </div>
        </div>
      </aside>

      {/* 2. Mobile Off-Canvas Overlay Drawer */}
      <MobileDrawer isOpen={isMobileOpen} onClose={closeMobile}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <Link href="/profile" onClick={closeMobile} className="inline-flex items-center">
            <AppLogoFull size={110} />
          </Link>
          <Button
            variant="none"
            onClick={closeMobile}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <SideNavMenu isCollapsed={false} />
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="relative">
            <SettingsNavDropdown
              openState={settingsOpen}
              onClose={() => setSettingsOpen(false)}
              isCollapsed={false}
            />
            <NavMenuItem
              item={settingsItem}
              isCollapsed={false}
              onClick={() => setSettingsOpen((p) => !p)}
            />
          </div>
        </div>
      </MobileDrawer>
    </>
  );
}

export function HeaderNavbar({
  showLogo = true,
  showMobileMenu = false,
  logoHref = "/profile",
}: {
  showLogo?: boolean;
  showMobileMenu?: boolean;
  logoHref?: string;
}) {
  const { data: user } = useSelector(selectUserSate);
  const router = useRouter();
  const { actionButtons, setNavHeight } = useNavContext();
  const { md } = useResize();
  const { toggleMobileOpen, isMobileOpen } = useSidebar();

  const navRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (navRef.current) setNavHeight(navRef.current.clientHeight || 0);
  }, [setNavHeight]);

  return (
    <header
      ref={navRef}
      className={cn(
        "bg-white border-b border-gray-200 px-4 md:px-8 py-2",
        "sticky top-0 z-40 h-fit",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left side: Hamburger menu button (if showMobileMenu is true) + Logo (if showLogo is true) */}
        <div className="flex items-center gap-3">
          {showMobileMenu && (
            <Button
              variant="none"
              onClick={toggleMobileOpen}
              className={cn(
                "p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg",
                "md:hidden",
              )}
              aria-label="Toggle navigation menu"
            >
              {isMobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          )}

          {showLogo && (
            <Link href={logoHref} className="inline-flex items-center">
              {md ? <AppLogoFull size={120} /> : <AppLogo size={35} />}
            </Link>
          )}
        </div>

        {/* Center: Search & Navigation buttons */}
        <div
          className={cn(
            "flex-1 max-w-2xl max-lg:max-w-lg flex items-center gap-2",
            "max-md:hidden",
          )}
        >
          <div className="flex items-center gap-1 max-lg:hidden">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="p-1.5"
              tooltip="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => router.forward()}
              variant="outline"
              className="p-1.5"
              tooltip="Go forward"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <NavbarSearch />

          <div className="hidden lg:flex items-center">{actionButtons}</div>
        </div>

        {/* Right side: Store selector + Notification Bell + Profile */}
        <div className="flex items-center gap-0">
          {showMobileMenu && <StoreSelector />}
          <NotificationBellButton />
          <ProfileButton user={user} />
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

const ProfileButton = ({ user }: { user: UserDto }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleClick = () => {
    if (isAuthenticated) {
      setIsProfileOpen((p) => !p);
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <div className="border-l border-gray-200 pl-1 sm:pl-2">
      <div
        className={cn(
          "flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 rounded-xl py-1 px-2 cursor-pointer",
          "hover:bg-gray-100 active:bg-gray-300 transition-all duration-200",
          "select-none",
        )}
        onClick={handleClick}
      >
        {isAuthenticated ? (
          <div className="text-right max-sm:hidden">
            <p className="text-gray-900 text-sm font-medium">
              {user?.userName}
            </p>
            <p className="text-xs text-gray-500">Member</p>
          </div>
        ) : (
          <div className="text-right max-sm:hidden">
            <p className="text-gray-900 text-sm">Sign in</p>
          </div>
        )}
        <Avatar size={36} />
      </div>
      <ProfileDropdown
        openState={isProfileOpen && isAuthenticated}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};
