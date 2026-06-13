"use client";

import React from "react";
import { cn } from "../utils";
import {
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { Button } from "./Button";

export type BannerVariant = "info" | "warning" | "danger" | "success";

export interface BannerProps {
  variant?: BannerVariant;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const variantStyles: Record<
  BannerVariant,
  {
    container: string;
    iconColor: string;
    titleColor: string;
    descColor: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  info: {
    container: "bg-indigo-50/70 border-indigo-100 text-indigo-950",
    iconColor: "text-indigo-600",
    titleColor: "text-indigo-950",
    descColor: "text-indigo-900/80",
    icon: Info,
  },
  warning: {
    container: "bg-amber-50 border-amber-200 text-amber-950",
    iconColor: "text-amber-600",
    titleColor: "text-amber-950",
    descColor: "text-amber-900/80",
    icon: AlertTriangle,
  },
  danger: {
    container: "bg-red-50 border-red-200 text-red-950",
    iconColor: "text-red-600",
    titleColor: "text-red-950",
    descColor: "text-red-900/80",
    icon: AlertCircle,
  },
  success: {
    container: "bg-green-50 border-green-200 text-green-950",
    iconColor: "text-green-600",
    titleColor: "text-green-950",
    descColor: "text-green-900/80",
    icon: CheckCircle2,
  },
};

export const Banner = ({
  variant = "info",
  title,
  description,
  children,
  onClose,
  className,
}: BannerProps) => {
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <div
      className={cn(
        "rounded-xl p-4 border flex items-start gap-3 relative transition-all duration-200",
        styles.container,
        className,
      )}
    >
      <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", styles.iconColor)} />
      <div className="flex-1 text-sm space-y-1">
        {title && (
          <span className={cn("font-semibold block", styles.titleColor)}>
            {title}
          </span>
        )}
        {(description || children) && (
          <div className={cn("leading-relaxed", styles.descColor)}>
            {description || children}
          </div>
        )}
      </div>
      {onClose && (
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 border-transparent bg-transparent"
          aria-label="Dismiss banner"
          tooltip="Close"
        >
          <X size={15} />
        </Button>
      )}
    </div>
  );
};
