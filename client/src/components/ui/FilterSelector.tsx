"use client";

import { SelectType } from "@/types/SelectType";
import clsx from "clsx";
import { ListFilterPlus } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "./Button";
import { Dropdown } from "./Dropdown";

export const FilterSelector = ({
  id,
  value,
  options = [],
  onChange,
  disabled,
}: SelectType) => {
  const uid = id || useId();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>(value ?? "");
  const ref = useRef<HTMLDivElement | null>(null);

  const normalized = options.map((o) =>
    typeof o === "string" ? { key: o, value: o } : o,
  );

  useEffect(() => {
    setSelected(value ?? "");
  }, [value]);

  function handleClick() {
    if (disabled) return;
    setOpen((p) => !p);
  }

  function selectValue(val: string) {
    if (disabled) return;
    setSelected(val);
    onChange?.(val);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        onClick={handleClick}
        disabled={disabled}
        tooltip="Filter"
      >
        <ListFilterPlus size={18} className="text-primary" />
      </Button>
      {/* dropdown */}
      <div className="flex justify-end">
        <Dropdown
          openState={open && !disabled}
          onClose={() => setOpen(false)}
          aria-labelledby={uid}
          className="mt-2 w-fit"
        >
          <ul>
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
      </div>
    </div>
  );
};
