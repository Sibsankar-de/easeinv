"use client";

import { SelectType } from "@/types/SelectType";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import {
  KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
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
}: SelectType) => {
  const generatedId = useId();
  const uid = id || generatedId;
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>(value ?? "");
  const [isFocused, setIsFocused] = useState(false);
  const [direction, setDirection] = useState<"top" | "bottom">("bottom");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const ref = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const normalized = useMemo(
    () =>
      options.map((o) => (typeof o === "string" ? { key: o, value: o } : o)),
    [options],
  );

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const dropdownHeight = 260;
      const targetDirection =
        spaceBelow < dropdownHeight && rect.top > dropdownHeight
          ? "top"
          : "bottom";

      setTimeout(() => {
        setDirection(targetDirection);
      }, 0);
    } else if (!open) {
      setTimeout(() => {
        setDirection("bottom");
      }, 0);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      const idx = normalized.findIndex((o) => o.key === selected);
      setTimeout(() => {
        setFocusedIndex(idx >= 0 ? idx : 0);
      }, 0);
    } else {
      setTimeout(() => {
        setFocusedIndex(-1);
      }, 0);
    }
  }, [open, selected, normalized]);

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
      if (open && focusedIndex >= 0 && focusedIndex < normalized.length) {
        selectValue(normalized[focusedIndex].key);
      } else {
        setOpen((s) => !s);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        setFocusedIndex((prev) => Math.min(prev + 1, normalized.length - 1));
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
          className,
        )}
        onClick={handleClick}
      >
        <div
          ref={triggerRef}
          id={uid}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={clsx(
            "w-full resize-y outline-none border-none bg-transparent",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <span className="truncate select-none">
            {!selected
              ? placeholder
              : (normalized.find((o) => o.key === selected)?.value ?? selected)}
          </span>
        </div>
        <div
          className={cn(
            "transition-transform duration-200",
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
            "w-full overflow-auto",
            dropdownClass,
          )}
        >
          <ul ref={listRef} role="listbox" aria-labelledby={uid}>
            {normalized.map((opt) => (
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
        "px-4 py-2 rounded-md hover:bg-accent hover:text-white cursor-pointer",
        isSelected && "font-semibold bg-secondary text-white",
      )}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {opt.value}
    </li>
  );
};
