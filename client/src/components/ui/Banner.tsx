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

export type BannerVariant =
  | "info"
  | "blue"
  | "primary"
  | "secondary"
  | "purple"
  | "warning"
  | "danger"
  | "success"
  | "neutral";

export type BannerSize = "sm" | "md";

export interface BannerProps {
  variant?: BannerVariant;
  size?: BannerSize;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }> | React.ReactElement | null;
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
    defaultIcon: React.ComponentType<{ className?: string }>;
  }
> = {
  info: {
    container: "bg-blue-50/70 border-blue-200 text-blue-950",
    iconColor: "text-blue-600",
    titleColor: "text-blue-950",
    descColor: "text-blue-900/90",
    defaultIcon: Info,
  },
  blue: {
    container: "bg-blue-50/70 border-blue-200 text-blue-950",
    iconColor: "text-blue-600",
    titleColor: "text-blue-950",
    descColor: "text-blue-900/90",
    defaultIcon: Info,
  },
  primary: {
    container: "bg-indigo-50/70 border-indigo-200 text-indigo-950",
    iconColor: "text-indigo-600",
    titleColor: "text-indigo-950",
    descColor: "text-indigo-900/90",
    defaultIcon: Info,
  },
  secondary: {
    container: "bg-purple-50/70 border-purple-200 text-purple-950",
    iconColor: "text-purple-600",
    titleColor: "text-purple-950",
    descColor: "text-purple-900/90",
    defaultIcon: Info,
  },
  purple: {
    container: "bg-purple-50/70 border-purple-200 text-purple-950",
    iconColor: "text-purple-600",
    titleColor: "text-purple-950",
    descColor: "text-purple-900/90",
    defaultIcon: Info,
  },
  warning: {
    container: "bg-amber-50 border-amber-200 text-amber-950",
    iconColor: "text-amber-600",
    titleColor: "text-amber-950",
    descColor: "text-amber-900/90",
    defaultIcon: AlertTriangle,
  },
  danger: {
    container: "bg-red-50/80 border-red-200 text-red-950",
    iconColor: "text-red-600",
    titleColor: "text-red-950",
    descColor: "text-red-900/90",
    defaultIcon: AlertCircle,
  },
  success: {
    container: "bg-emerald-50 border-emerald-200 text-emerald-950",
    iconColor: "text-emerald-600",
    titleColor: "text-emerald-950",
    descColor: "text-emerald-900/90",
    defaultIcon: CheckCircle2,
  },
  neutral: {
    container: "bg-gray-50 border-gray-200 text-gray-900",
    iconColor: "text-gray-500",
    titleColor: "text-gray-900",
    descColor: "text-gray-700",
    defaultIcon: Info,
  },
};

export const Banner = ({
  variant = "info",
  size = "md",
  title,
  description,
  children,
  icon: customIcon,
  onClose,
  className,
}: BannerProps) => {
  const styles = variantStyles[variant] || variantStyles.info;
  const isSmall = size === "sm";

  const renderIcon = () => {
    if (customIcon) {
      if (React.isValidElement(customIcon)) {
        return customIcon;
      }
      const CustomIconComponent = customIcon as React.ComponentType<{
        className?: string;
      }>;
      return (
        <CustomIconComponent
          className={cn(
            isSmall ? "w-4 h-4 mt-0.5" : "w-5 h-5 mt-0.5",
            "shrink-0",
            styles.iconColor,
          )}
        />
      );
    }

    const DefaultIcon = styles.defaultIcon;
    return (
      <DefaultIcon
        className={cn(
          isSmall ? "w-4 h-4 mt-0.5" : "w-5 h-5 mt-0.5",
          "shrink-0",
          styles.iconColor,
        )}
      />
    );
  };

  return (
    <div
      className={cn(
        "border flex items-start relative transition-all duration-200",
        isSmall
          ? "p-3 rounded-lg text-xs sm:text-sm gap-2.5"
          : "p-4 rounded-xl text-sm gap-3",
        styles.container,
        className,
      )}
    >
      {renderIcon()}
      <div className="flex-1 space-y-1">
        {title && (
          <span
            className={cn(
              "font-semibold block",
              isSmall ? "text-xs sm:text-sm" : "text-sm",
              styles.titleColor,
            )}
          >
            {title}
          </span>
        )}
        {(description || children) && (
          <div
            className={cn(
              "leading-relaxed",
              isSmall ? "text-xs sm:text-sm" : "text-sm",
              styles.descColor,
            )}
          >
            {description || children}
          </div>
        )}
      </div>
      {onClose && (
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className={cn(
            "p-1 border-transparent bg-transparent",
            isSmall ? "top-2.5 right-2.5 absolute" : "top-3.5 right-3.5 absolute",
          )}
          aria-label="Dismiss banner"
          tooltip="Close"
        >
          <X size={isSmall ? 13 : 15} />
        </Button>
      )}
    </div>
  );
};
