"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useResize } from "./ResizeContext";

interface SidebarContextType {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (val: boolean) => void;
  toggleMobileOpen: () => void;
  setMobileOpen: (val: boolean) => void;
  closeMobile: () => void;
}

const defaultSidebarContext: SidebarContextType = {
  isCollapsed: false,
  isMobileOpen: false,
  toggleCollapsed: () => {},
  setCollapsed: () => {},
  toggleMobileOpen: () => {},
  setMobileOpen: () => {},
  closeMobile: () => {},
};

const SidebarContext = createContext<SidebarContextType | undefined>(
  undefined,
);

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { width, md, lg } = useResize();
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [userToggled, setUserToggled] = useState<boolean>(false);

  // Auto handle collapse state based on breakpoint transitions if user hasn't explicitly toggled
  useEffect(() => {
    if (width === 0) return; // Wait for resize context initialization

    const timer = setTimeout(() => {
      if (!userToggled) {
        if (md && !lg) {
          // Medium screens (tablet): collapse to icon-only view
          setIsCollapsed(true);
        } else if (lg) {
          // Large screens (desktop): expand sidebar
          setIsCollapsed(false);
        }
      }

      // Always close mobile drawer on breakpoint resize to desktop/tablet
      if (md) {
        setIsMobileOpen(false);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [width, md, lg, userToggled]);

  // Close mobile menu and collapse tablet overlay on route changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMobileOpen(false);
      if (md && !lg) {
        setIsCollapsed(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [pathname, md, lg]);

  const toggleCollapsed = () => {
    setUserToggled(true);
    setIsCollapsed((prev) => !prev);
  };

  const setCollapsed = (val: boolean) => {
    setUserToggled(true);
    setIsCollapsed(val);
  };

  const toggleMobileOpen = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const setMobileOpen = (val: boolean) => {
    setIsMobileOpen(val);
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isMobileOpen,
        toggleCollapsed,
        setCollapsed,
        toggleMobileOpen,
        setMobileOpen,
        closeMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  return context ?? defaultSidebarContext;
};
