"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useAppRouter as useRouter } from "@/hooks/useAppRouter";
import React, { useEffect } from "react";

export const PreAuthPageLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { isAuthenticated, isAuthChecking } = useAuth();

  useEffect(() => {
    if (!isAuthChecking && isAuthenticated) {
      const searchParams = new URLSearchParams(window.location.search);
      const redirectParam = searchParams.get("redirect");
      const redirectTo =
        redirectParam && redirectParam.startsWith("/")
          ? redirectParam
          : "/profile";
      router.push(redirectTo);
    }
  }, [router, isAuthenticated, isAuthChecking]);

  if (!isAuthChecking && !isAuthenticated) {
    return children;
  }

  return null;
};
