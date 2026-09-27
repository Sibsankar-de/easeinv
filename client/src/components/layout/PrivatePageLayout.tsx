"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useAppRouter as useRouter } from "@/hooks/useAppRouter";
import React, { useEffect } from "react";

export const PrivatePageLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { isAuthenticated, isAuthChecking } = useAuth();

  useEffect(() => {
    if (!isAuthChecking && !isAuthenticated) {
      const currentUrl = window.location.pathname + window.location.search;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [router, isAuthenticated, isAuthChecking]);

  if (!isAuthChecking && isAuthenticated) {
    return children;
  }

  return null;
};
