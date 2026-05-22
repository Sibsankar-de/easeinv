"use client";

import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import { cn } from "../utils";

export const AppLoadingLayout = ({ children }: { children: ReactNode }) => {
  const { isAuthChecking } = useAuth();
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isAuthChecking || showLoader) {
    return <AppLoader />;
  }

  return children;
};

const AppLoader = () => (
  <div
    className={cn(
      "h-screen w-screen fixed top-0 left-0 z-100",
      "flex items-center justify-center bg-white",
    )}
  >
    <Image
      src={"/easeinv-logo-loader.gif"}
      alt="Loading..."
      height={150}
      width={150}
      draggable={false}
    />
  </div>
);
