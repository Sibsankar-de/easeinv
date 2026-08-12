"use client";

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import websiteStaticMetaData from "@/configs/websiteStaticMetaData";
import { TurnstileRef } from "@/hooks/useTurnstile";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: (error?: any) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
        },
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

export interface TurnstileWidgetProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error?: any) => void;
  theme?: "light" | "dark" | "auto";
  className?: string;
}

export const TurnstileWidget = forwardRef<TurnstileRef, TurnstileWidgetProps>(
  (
    {
      siteKey = websiteStaticMetaData.turnstileSiteKey,
      onVerify,
      onExpire,
      onError,
      theme = "light",
      className = "",
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<string | null>(null);

    const renderWidget = () => {
      if (
        !containerRef.current ||
        !window.turnstile ||
        widgetIdRef.current !== null
      ) {
        return;
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          callback: (token: string) => {
            onVerify(token);
          },
          "expired-callback": () => {
            onExpire?.();
          },
          "error-callback": (err?: any) => {
            onError?.(err);
          },
        });
        widgetIdRef.current = id;
      } catch (e) {
        console.error("Failed to render Turnstile widget:", e);
      }
    };

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (window.turnstile && widgetIdRef.current !== null) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch {
            // ignore reset error
          }
        }
      },
    }));

    useEffect(() => {
      const scriptId = "cf-turnstile-script";

      if (window.turnstile) {
        renderWidget();
        return;
      }

      let script = document.getElementById(
        scriptId,
      ) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      window.onTurnstileLoad = () => {
        renderWidget();
      };

      return () => {
        if (window.turnstile && widgetIdRef.current !== null) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // ignore error during cleanup
          }
          widgetIdRef.current = null;
        }
      };
    }, [siteKey]);

    return (
      <div className={`my-3 flex justify-center ${className}`}>
        <div ref={containerRef} />
      </div>
    );
  },
);

export default TurnstileWidget;
