"use client";

import * as React from "react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button, ButtonType } from "./Button";
import { Dropdown } from "./Dropdown";
import { cn } from "../utils";

export interface DropdownMenuItem {
  key?: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  disabled?: boolean;
}

export interface DropdownButtonProps extends ButtonType {
  items: DropdownMenuItem[];
  dropdownClassName?: string;
}

export const DropdownButton: React.FC<DropdownButtonProps> = ({
  children,
  onClick,
  items,
  variant = "primary",
  disabled = false,
  loading = false,
  loadingMessage,
  className,
  dropdownClassName,
  tooltip,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  const handleMainClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    if (onClick) {
      onClick(e);
    } else {
      setOpen((prev) => !prev);
    }
  };

  const handleItemClick = (e: React.MouseEvent, item: DropdownMenuItem) => {
    setOpen(false);
    if (item.onClick) {
      item.onClick(e);
    }
  };

  const dividerClass =
    variant === "primary"
      ? "border-l border-primary-foreground/25"
      : variant === "dark"
        ? "border-l border-white/20"
        : "border-l border-border";

  return (
    <div className={cn("relative inline-flex items-stretch", className)}>
      <Button
        variant={variant}
        disabled={disabled}
        loading={loading}
        loadingMessage={loadingMessage}
        onClick={handleMainClick}
        tooltip={tooltip}
        className="rounded-r-none border-r-0 self-stretch"
        {...props}
      >
        {children}
      </Button>
      <Button
        variant={variant}
        disabled={disabled || loading}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className={cn(
          "px-2.5 rounded-l-none self-stretch flex items-center justify-center",
          dividerClass,
        )}
        tooltip="More options"
      >
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-200 shrink-0",
            open && "rotate-180",
          )}
        />
      </Button>

      <Dropdown
        openState={open}
        onClose={() => setOpen(false)}
        className={cn(
          "w-48 right-0 left-auto top-full mt-1 p-1 shadow-lg border border-border bg-white z-50",
          dropdownClassName,
        )}
      >
        <div className="flex flex-col gap-0.5">
          {items.map((item, idx) => (
            <button
              key={item.key || idx}
              type="button"
              disabled={item.disabled}
              onClick={(e) => handleItemClick(e, item)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer",
                item.disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              {item.icon && (
                <span className="w-4 h-4 flex items-center justify-center shrink-0">
                  {item.icon}
                </span>
              )}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </Dropdown>
    </div>
  );
};
