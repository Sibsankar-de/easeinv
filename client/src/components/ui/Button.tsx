"use client";

import { ClassValue } from "clsx";
import { cn } from "../utils";
import { Loader } from "./loader";
import { Tooltip } from "react-tooltip";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export interface ButtonType extends React.ComponentProps<"button"> {
  children?: React.ReactNode;
  type?: "button" | "reset" | "submit";
  className?: string;
  id?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  variant?:
    | "nav"
    | "primary"
    | "none"
    | "secondary"
    | "outline"
    | "danger"
    | "dark";
  disabled?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  tooltip?: string;
  tooltipId?: string;
}

export const Button = ({
  children,
  className,
  id,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
  loading = false,
  loadingMessage,
  tooltip,
  tooltipId = "button-tooltip",
  ...props
}: ButtonType) => {
  const variants: Record<string, ClassValue> = {
    nav: "",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline:
      "border border-border bg-background text-foreground hover:bg-accent/50 hover:text-accent-foreground",
    danger: "text-red-400 border border-border bg-gray-100 hover:bg-red-100",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    dark: "bg-[#353535] text-white hover:bg-gray-800",
    none: "hover:brightness-95",
  };

  // wait until mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      type={type}
      className={cn(
        "flex items-center gap-2 px-4 py-2 border border-transparent rounded-lg",
        "cursor-pointer select-none relative text-sm",
        "disabled:brightness-75 disabled:cursor-not-allowed",
        "focus-visible:ring-blue-400 focus-visible:ring-1",
        "transition-all duration-150 active:translate-y-0.5 active:brightness-90",
        variants[variant],
        loading && "bg-gray-300",
        className,
      )}
      id={id}
      onClick={(e) => onClick?.(e)}
      disabled={disabled}
      data-tooltip-id={tooltipId}
      data-tooltip-content={tooltip}
      {...props}
    >
      {children}
      {/* Spinner for loading */}
      {loading && (
        <div
          aria-disabled={true}
          className={cn(
            "absolute w-full h-full inset-0 flex justify-center items-center gap-2",
            "bg-gray-300",
            "border-none! rounded-lg! transition-none! pointer-events-none!",
          )}
        >
          <Loader
            className="border-white border-t-primary"
            size={loadingMessage ? 18 : 22}
          />
          {loadingMessage && (
            <span className="text-sm text-slate-700">{loadingMessage}</span>
          )}
        </div>
      )}

      {mounted &&
        createPortal(
          <Tooltip id={tooltipId} place="bottom" delayShow={800} />,
          document.body,
        )}
    </button>
  );
};
