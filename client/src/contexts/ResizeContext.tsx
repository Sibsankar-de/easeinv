"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

interface ResizeContextType {
  width: number;
  height: number;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  xxl: boolean;
  breakpoint: Breakpoint;
}

const ResizeContext = createContext<ResizeContextType | undefined>(undefined);

export const ResizeProvider = ({ children }: { children: React.ReactNode }) => {
  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);

    // Set initial size
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getBreakpoint = (width: number): Breakpoint => {
    if (width >= 1536) return "xxl";
    if (width >= 1280) return "xl";
    if (width >= 1024) return "lg";
    if (width >= 768) return "md";
    if (width >= 640) return "sm";
    return "xs";
  };

  const value: ResizeContextType = {
    width: windowSize.width,
    height: windowSize.height,
    sm: windowSize.width >= 640,
    md: windowSize.width >= 768,
    lg: windowSize.width >= 1024,
    xl: windowSize.width >= 1280,
    xxl: windowSize.width >= 1536,
    breakpoint: getBreakpoint(windowSize.width),
  };

  return (
    <ResizeContext.Provider value={value}>{children}</ResizeContext.Provider>
  );
};

export const useResize = () => {
  const context = useContext(ResizeContext);
  if (context === undefined) {
    throw new Error("useResize must be used within a ResizeProvider");
  }
  return context;
};
