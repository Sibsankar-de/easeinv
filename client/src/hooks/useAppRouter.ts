"use client";

import { useRouter as useNextRouter } from "next/navigation";
import { startPageProgress } from "@/components/ui/NavigationProgressBar";
import { useCallback, useMemo } from "react";
import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function useAppRouter() {
  const router = useNextRouter();

  const push = useCallback(
    (href: string, options?: NavigateOptions) => {
      if (typeof window !== "undefined") {
        try {
          const target = href.startsWith("/")
            ? new URL(href, window.location.origin)
            : new URL(href);
          if (
            target.pathname !== window.location.pathname ||
            target.search !== window.location.search
          ) {
            startPageProgress();
          }
        } catch {
          startPageProgress();
        }
      }
      return router.push(href, options);
    },
    [router],
  );

  const replace = useCallback(
    (href: string, options?: NavigateOptions) => {
      if (typeof window !== "undefined") {
        try {
          const target = href.startsWith("/")
            ? new URL(href, window.location.origin)
            : new URL(href);
          if (
            target.pathname !== window.location.pathname ||
            target.search !== window.location.search
          ) {
            startPageProgress();
          }
        } catch {
          startPageProgress();
        }
      }
      return router.replace(href, options);
    },
    [router],
  );

  const back = useCallback(() => {
    startPageProgress();
    return router.back();
  }, [router]);

  const forward = useCallback(() => {
    startPageProgress();
    return router.forward();
  }, [router]);

  return useMemo(
    () => ({
      ...router,
      push,
      replace,
      back,
      forward,
    }),
    [router, push, replace, back, forward],
  );
}
