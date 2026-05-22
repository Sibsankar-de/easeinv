"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  KeyboardEvent,
  ReactNode,
} from "react";

import { Input, InputType } from "./Input";
import { Dropdown } from "./Dropdown";
import { cn } from "../utils";
import { SliderLoader } from "./loader";

type Ctx<T> = {
  focusedIndex: number;
  selected: T | null;
  items: T[];
  handleSelect: (item: T) => void;
};

const SearchWrapperContext = createContext<Ctx<any> | null>(null);

export function useSelectableInputDropdown<T>() {
  const ctx = useContext(SearchWrapperContext);
  if (!ctx) throw new Error("SearchItem must be used inside SearchWrapper");
  return ctx as Ctx<T>;
}

type Props<T> = {
  items: T[];
  value: string;
  inputProps?: InputType;
  closeOnEmpty?: boolean;
  isLoading?: boolean;
  onChange: (value: string) => void;
  onSelect: (item: T) => void;
  getLabel: (item: T) => string;
  children: (items: T[]) => ReactNode;
};

export function SelectableInputDropdown<T>({
  items,
  value,
  inputProps,
  closeOnEmpty = false,
  isLoading = false,
  onChange,
  onSelect,
  getLabel,
  children,
}: Props<T>) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [selected, setSelected] = useState<T | null>(null);
  const [open, setOpen] = useState(false);

  const ulRef = useRef<HTMLUListElement>(null);

  // auto scroll focused item
  useEffect(() => {
    const el = ulRef.current?.children[focusedIndex] as HTMLElement;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [focusedIndex, items]);

  function handleSelect(item: T) {
    setSelected(item);
    onSelect(item);
    onChange(getLabel(item));
    setOpen(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((p) => Math.max(p - 1, 0));
        break;

      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((p) => Math.min(p + 1, items.length - 1));
        break;

      case "Enter":
        e.preventDefault();
        const item = items[focusedIndex];
        if (item) handleSelect(item);
        break;
    }
  }

  return (
    <SearchWrapperContext.Provider
      value={{ focusedIndex, selected, items, handleSelect }}
    >
      <div className="relative flex-1">
        <Input
          placeholder={inputProps?.placeholder || "Search…"}
          value={value}
          onChange={(v) => {
            onChange(v); // parent filters
            if (closeOnEmpty && !items.length) {
              setOpen(false);
            } else {
              setOpen(v.trim().length > 0);
            }
            setFocusedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          {...inputProps}
        />

        <Dropdown
          openState={open}
          className="w-full mt-1 p-0! max-h-60 overflow-y-auto"
          onClose={() => setOpen(false)}
        >
          <SliderLoader
            className="w-full bg-transparent! absolute! top-0"
            isVisible={isLoading}
          />
          <div className="w-full p-1">
            <ul ref={ulRef}>{children(items)}</ul>

            {!items.length && (
              <p className="p-2 text-center text-gray-600">No results found!</p>
            )}
          </div>
        </Dropdown>
      </div>
    </SearchWrapperContext.Provider>
  );
}

interface SearchItemProps<T> extends React.ComponentProps<"li"> {
  item: T;
  index: number;
  children: ReactNode;
}

export function SelectableItem<T>({
  item,
  index,
  children,
  className,
  ...props
}: SearchItemProps<T>) {
  const { focusedIndex, selected, handleSelect } =
    useSelectableInputDropdown<T>();

  return (
    <li
      className={cn(
        "p-2 px-3 rounded cursor-pointer",
        index === focusedIndex && "bg-accent!",
        (selected as any)?._id === (item as any)._id && "bg-muted",
        className,
      )}
      onClick={() => handleSelect(item)}
      {...props}
    >
      {children}
    </li>
  );
}
