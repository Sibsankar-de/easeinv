"use client";

import { SelectableInputDropdown } from "@/components/ui/SelectableInputDropdown";
import { ReactNode, useEffect, useRef, useState } from "react";
import { DebounceContext, getSearchDebounceTime } from "@/utils/get-debounce";
import { InputType } from "./Input";

type SearchableInputProps<T> = {
  items: T[];
  value?: string;
  placeholder?: string;
  closeOnEmpty?: boolean;
  inputProps?: InputType;
  getLabel: (item: T) => string;
  onSelect: (item: T) => void;
  onSearch: (query: string) => void;
  onChange?: (e: string) => void;
  children: (items: T[]) => ReactNode;
  minCharsToSearch?: number;
  trimQuery?: boolean;
  isLoading?: boolean;
};

export function SearchableInput<T>({
  items,
  value = "",
  placeholder = "Type to search…",
  closeOnEmpty,
  inputProps,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getLabel,
  onSearch,
  onChange,
  onSelect,
  children,
  minCharsToSearch = 1,
  trimQuery = true,
  isLoading = false,
}: SearchableInputProps<T>) {
  const [prevValue, setPrevValue] = useState(value);
  const [input, setInput] = useState(value);

  const debounceCtxRef = useRef<DebounceContext>({});

  const timeoutRef = useRef<number | null>(null);

  const lastEmittedQueryRef = useRef<string>("");

  const noResultPrefixRef = useRef<string>("");
  const latestSearchQueryRef = useRef<string>("");

  const normalize = (q: string) => {
    const s = trimQuery ? q.trim() : q;
    return s;
  };

  if (value !== prevValue) {
    setPrevValue(value);
    setInput(value);
  }

  useEffect(() => {
    const latestQuery = latestSearchQueryRef.current;
    if (!latestQuery) return;

    if (items.length === 0) {
      noResultPrefixRef.current = latestQuery;
    } else {
      noResultPrefixRef.current = "";
    }
  }, [items]);

  const cancelPendingSearch = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleSelect = (item: T) => {
    cancelPendingSearch();
    noResultPrefixRef.current = "";
    onSelect(item);
    setInput(value);
  };

  const handleChange = (nextRawValue: string) => {
    if (nextRawValue === input) return;

    setInput(nextRawValue);
    onChange?.(nextRawValue);

    cancelPendingSearch();

    const nextValue = normalize(nextRawValue);

    if (nextValue.length < minCharsToSearch) {
      noResultPrefixRef.current = "";
      return;
    }

    if (nextValue === lastEmittedQueryRef.current) return;

    const blockedPrefix = noResultPrefixRef.current;

    if (
      blockedPrefix &&
      nextValue.length > blockedPrefix.length &&
      nextValue.startsWith(blockedPrefix)
    ) {
      return;
    }

    const delay = getSearchDebounceTime(nextValue, debounceCtxRef.current);

    timeoutRef.current = window.setTimeout(() => {
      lastEmittedQueryRef.current = nextValue;
      latestSearchQueryRef.current = nextValue;
      onSearch(nextValue);
    }, delay);
  };

  return (
    <SelectableInputDropdown
      items={items}
      value={input}
      inputProps={{ placeholder, ...inputProps }}
      closeOnEmpty={closeOnEmpty}
      isLoading={isLoading}
      onSelect={handleSelect}
      onChange={handleChange}
    >
      {children}
    </SelectableInputDropdown>
  );
}
