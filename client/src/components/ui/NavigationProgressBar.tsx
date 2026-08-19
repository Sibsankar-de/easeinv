"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type ProgressState = "idle" | "loading" | "completing";

// Custom event helpers for programmatic progress control
export const startPageProgress = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app:progress-start"));
  }
};

export const completePageProgress = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app:progress-complete"));
  }
};

function NavigationProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [state, setState] = useState<ProgressState>("idle");
  const [progress, setProgress] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathnameRef = useRef(pathname);
  const prevSearchRef = useRef(searchParams.toString());
  const stateRef = useRef(state);

  // Keep stateRef in sync so event listeners always see the latest value
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const clearAll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current);
  }, []);

  const startProgress = useCallback(() => {
    clearAll();
    setProgress(0);
    setState("loading");

    let current = 0;
    intervalRef.current = setInterval(() => {
      // Smooth asymptotic curve approaching 85%
      const remaining = 85 - current;
      const increment = remaining * 0.12;
      current = Math.min(current + increment, 85);
      setProgress(current);
      if (current >= 84.9) clearInterval(intervalRef.current!);
    }, 100);
  }, [clearAll]);

  const completeProgress = useCallback(() => {
    clearAll();
    setProgress(100);
    setState("completing");

    completeTimeoutRef.current = setTimeout(() => {
      setState("idle");
      setProgress(0);
    }, 400);
  }, [clearAll]);

  // Intercept <Link> / <a> clicks — only trigger for real same-origin navigations
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Ignore right-click or modified clicks (cmd, ctrl, shift, alt)
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        e.shiftKey
      ) {
        return;
      }

      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;

      // Ignore links with target="_blank" or download attribute
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      const isSameOrigin =
        href.startsWith("/") || href.startsWith(window.location.origin);
      if (!isSameOrigin) return;

      try {
        const targetUrl = href.startsWith("/")
          ? new URL(href, window.location.origin)
          : new URL(href);

        // Skip if same page (identical pathname and search params)
        if (
          targetUrl.pathname === window.location.pathname &&
          targetUrl.search === window.location.search
        ) {
          return;
        }

        startProgress();
      } catch {
        // Ignore invalid URLs
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [startProgress]);

  // Listen to custom programmatic navigation events
  useEffect(() => {
    const handleStart = () => startProgress();
    const handleComplete = () => completeProgress();

    window.addEventListener("app:progress-start", handleStart);
    window.addEventListener("app:progress-complete", handleComplete);

    return () => {
      window.removeEventListener("app:progress-start", handleStart);
      window.removeEventListener("app:progress-complete", handleComplete);
    };
  }, [startProgress, completeProgress]);

  // Detect navigation completion: usePathname / searchParams only update after RSC render commits
  useEffect(() => {
    const currentSearch = searchParams.toString();
    const hasChanged =
      pathname !== prevPathnameRef.current ||
      currentSearch !== prevSearchRef.current;

    prevPathnameRef.current = pathname;
    prevSearchRef.current = currentSearch;

    if (hasChanged && stateRef.current === "loading") {
      const rafId = requestAnimationFrame(() => {
        completeProgress();
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [pathname, searchParams, completeProgress]);

  // Cleanup on unmount
  useEffect(() => clearAll, [clearAll]);

  if (state === "idle") return null;

  return (
    <div
      role="progressbar"
      aria-label="Page loading"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 right-0 z-9999 pointer-events-none"
    >
      <div
        className="h-[3px] bg-primary"
        style={{
          width: `${progress}%`,
          opacity: state === "completing" ? 0 : 1,
          transition:
            state === "completing"
              ? "opacity 300ms ease-out, width 150ms ease-out"
              : "width 120ms ease-out",
        }}
      />
    </div>
  );
}

/**
 * NavigationProgressBar
 *
 * Renders a top-of-page progress bar that tracks actual Next.js App Router
 * navigation lifecycle — starts on link click or custom event and completes
 * only when usePathname() changes (i.e. after the RSC payload is fetched and
 * React has committed the new render tree).
 *
 * Wrapped in <Suspense> to safely handle useSearchParams().
 */
export function NavigationProgressBar() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressBarInner />
    </Suspense>
  );
}
