"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export const PrivatePageLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { isAuthenticated, isAuthChecking } = useAuth();
  if (!isAuthChecking && isAuthenticated) {
    return children;
  }

  useEffect(() => {
    if (!isAuthChecking && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [router, isAuthenticated, isAuthChecking]);

  return null;
};
