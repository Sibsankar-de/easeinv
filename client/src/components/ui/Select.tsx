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
}: SelectType) => {
  const uid = id || useId();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>(value ?? "");
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const normalized = options.map((o) =>
    typeof o === "string" ? { key: o, value: o } : o,
  );

  useEffect(() => {
    setSelected(value ?? "");
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
  }

  function onKeyDown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setOpen((s) => !s);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative cursor-pointer" ref={ref}>
      <div
        className={clsx(
          "w-full pl-3 pr-4 py-2 border border-gray-300 rounded-lg h-fit flex items-center justify-between gap-2 relative",
          "transition-all duration-200 focus-within:ring-primary focus-within:ring-2",
          isFocused && "ring-primary ring-2",
          className,
        )}
        onKeyDown={onKeyDown}
        onClick={handleClick}
      >
        <div
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
          onClose={() => setOpen(false)}
          className="mt-2 w-full"
        >
          <ul role="listbox" aria-labelledby={uid}>
            {normalized.map((opt) => (
              <li
                key={opt.key}
                role="option"
                aria-selected={selected === opt.key}
                tabIndex={0}
                className={clsx(
                  "px-4 py-2 rounded-md hover:bg-accent hover:text-white cursor-pointer",
                  selected === opt.key &&
                    "font-semibold bg-secondary text-white",
                )}
                onClick={() => selectValue(opt.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectValue(opt.key);
                  }
                }}
              >
                {opt.value}
              </li>
            ))}
          </ul>
        </Dropdown>
      )}
    </div>
  );
};
