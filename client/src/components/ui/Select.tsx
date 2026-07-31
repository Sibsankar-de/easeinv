"use client";

import { SelectType } from "@/types/SelectType";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { cn } from "../utils";
import { Dropdown } from "./Dropdown";

export const Select = ({
  id,
  placeholder,
  value,
  options = [],
  onChange,
  disabled,
  className,
  dropdownClass,
  errorMessage,
  icon,
}: SelectType) => {
  const generatedId = useId();
  const uid = id || generatedId;
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>(value ?? "");
  const [isFocused, setIsFocused] = useState(false);
  const [direction, setDirection] = useState<"top" | "bottom">("bottom");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);
  const ref = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setDirection("bottom");
        setMaxHeight(undefined);
      }, 0);
      return;
    }

    const parseMaxHeightClass = (className?: string): number | null => {
      if (!className) return null;
      const matches = className.split(/\s+/);
      for (const cls of matches) {
        const pxMatch = cls.match(/^max-h-\[(\d+)px\]$/);
        if (pxMatch) return parseInt(pxMatch[1], 10);

        const remMatch = cls.match(/^max-h-\[(\d+(?:\.\d+)?)rem\]$/);
        if (remMatch) return parseFloat(remMatch[1]) * 16;

        const vhMatch = cls.match(/^max-h-\[(\d+(?:\.\d+)?)vh\]$/);
        if (vhMatch) return (parseFloat(vhMatch[1]) * window.innerHeight) / 100;

        const twMatch = cls.match(/^max-h-(\d+)$/);
        if (twMatch) return parseInt(twMatch[1], 10) * 4;
      }
      return null;
    };

    const updateLayout = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const TOP_NAV_THRESHOLD = 65; // Reserve 60px at top for top nav bar
      const DROPDOWN_MARGIN = 8; // Margin for mt-2 / mb-2

      const spaceBelow = viewportHeight - rect.bottom - DROPDOWN_MARGIN - 12;
      const spaceAbove = rect.top - TOP_NAV_THRESHOLD - DROPDOWN_MARGIN;

      const configuredMaxHeight = parseMaxHeightClass(dropdownClass) ?? 260;

      const targetDirection =
        spaceBelow < configuredMaxHeight && spaceAbove > spaceBelow
          ? "top"
          : "bottom";

      const availableSpace =
        targetDirection === "top" ? spaceAbove : spaceBelow;

      // Ensure max height never goes beyond screen/nav bounds, overriding configured max height if needed
      const effectiveMaxHeight = Math.min(
        configuredMaxHeight,
        Math.max(40, Math.floor(availableSpace)),
      );

      setDirection(targetDirection);
      setMaxHeight(effectiveMaxHeight);
    };

    updateLayout();

    window.addEventListener("resize", updateLayout);
    window.addEventListener("scroll", updateLayout, true);

    return () => {
      window.removeEventListener("resize", updateLayout);
      window.removeEventListener("scroll", updateLayout, true);
    };
  }, [open, dropdownClass]);

  useEffect(() => {
    if (open) {
      const idx = options.findIndex((o) => o.key === selected);
      setTimeout(() => {
        setFocusedIndex(idx >= 0 ? idx : 0);
      }, 0);
    } else {
      setTimeout(() => {
        setFocusedIndex(-1);
      }, 0);
    }
  }, [open, selected, options]);

  useEffect(() => {
    if (open && focusedIndex >= 0 && listRef.current) {
      const listItems = listRef.current.children;
      const targetItem = listItems[focusedIndex] as HTMLElement;
      if (targetItem) {
        targetItem.focus();
      }
    }
  }, [focusedIndex, open]);

  useEffect(() => {
    setTimeout(() => {
      setSelected(value ?? "");
    }, 0);
  }, [value]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setIsFocused(false);
      }
    };
    window.addEventListener("mousedown", handleOutside);
    return () => window.removeEventListener("mousedown", handleOutside);
  }, []);

  function handleClick() {
    if (disabled) return;
    setIsFocused((p) => !p);
    setOpen((p) => !p);
  }

  function selectValue(val: string) {
    if (disabled) return;
    setSelected(val);
    onChange?.(val);
    setOpen(false);
    setIsFocused(false);
    setTimeout(() => {
      triggerRef.current?.focus();
    }, 0);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (open && focusedIndex >= 0 && focusedIndex < options.length) {
        selectValue(options[focusedIndex].key);
      } else {
        setOpen((s) => !s);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        setFocusedIndex((prev) => Math.min(prev + 1, options.length - 1));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      }
    }
  }

  return (
    <div className="relative cursor-pointer" ref={ref} onKeyDown={onKeyDown}>
      <div
        className={clsx(
          "w-full pl-3 pr-4 py-1.5 border border-gray-300 rounded-lg h-fit",
          "flex items-center justify-between gap-2 relative",
          "transition-all duration-200 focus-within:ring-primary focus-within:ring-2",
          isFocused && "ring-primary ring-2",
          errorMessage && "border-red-300 focus-within:ring-red-200",
          className,
        )}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2 w-full overflow-hidden">
          {icon && (
            <div
              className={cn(
                "w-fit h-fit flex items-center justify-center shrink-0 text-gray-400",
                isFocused && "text-primary",
              )}
            >
              {icon}
            </div>
          )}
          <div
            ref={triggerRef}
            id={uid}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-haspopup="listbox"
            aria-expanded={open}
            className={clsx(
              "w-full resize-y outline-none border-none bg-transparent flex items-center",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            <span className="truncate select-none">
              {!selected
                ? placeholder
                : (options.find((o) => o.key === selected)?.value ?? selected)}
            </span>
          </div>
        </div>
        <div
          className={cn(
            "transition-transform duration-200 shrink-0",
            isFocused ? "rotate-180" : "rotate-0",
          )}
        >
          <ChevronDown size={16} className="text-primary" />
        </div>
      </div>
      {/* dropdown */}
      {open && !disabled && (
        <Dropdown
          openState={open}
          onClose={() => {
            setOpen(false);
            setIsFocused(false);
            setTimeout(() => {
              triggerRef.current?.focus();
            }, 0);
          }}
          className={cn(
            direction === "top" ? "bottom-full mb-2" : "mt-2",
            "w-full overflow-auto select-none",
            dropdownClass,
          )}
          style={maxHeight ? { maxHeight: `${maxHeight}px` } : undefined}
        >
          <ul ref={listRef} role="listbox" aria-labelledby={uid}>
            {options.map((opt) => (
              <SelectOption
                key={opt.key}
                opt={opt}
                isSelected={selected === opt.key}
                onClick={() => selectValue(opt.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectValue(opt.key);
                  }
                }}
              />
            ))}
          </ul>
        </Dropdown>
      )}
      {errorMessage && (
        <p className="text-red-400 text-xs mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

const SelectOption = ({
  opt,
  isSelected,
  onClick,
  onKeyDown,
}: {
  opt: { key: string; value: string };
  isSelected: boolean;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) => {
  return (
    <li
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      className={clsx(
        "px-4 py-2 rounded-md hover:bg-accent hover:text-white cursor-pointer select-none",
        isSelected && "font-semibold bg-secondary text-white",
      )}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {opt.value}
    </li>
  );
};
