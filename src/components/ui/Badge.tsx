"use client";

import React from "react";
import { cn } from "../utils";

export type BadgeVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "dark";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: "bg-primary/10 text-primary border-transparent",
  secondary: "bg-secondary/10 text-secondary-foreground border-transparent",
  outline: "border-border text-foreground bg-transparent",
  success: "bg-chart-2/10 text-chart-2 border-transparent",
  warning: "bg-chart-4/10 text-chart-4 border-transparent",
  danger: "bg-destructive/10 text-destructive border-transparent",
  info: "bg-chart-3/10 text-chart-3 border-transparent",
  dark: "bg-[#353535]/10 text-[#353535] border-transparent",
};

export const Badge = ({
  children,
  className,
  variant = "primary",
  ...props
}: BadgeProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5",
        "text-[11px] font-semibold",
        "transition-colors select-none uppercase tracking-wider",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
