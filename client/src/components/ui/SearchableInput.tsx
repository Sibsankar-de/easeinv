"use client";

import { SelectableInputDropdown } from "@/components/ui/SelectableInputDropdown";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
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
  getLabel,
  onSearch,
  onChange,
  onSelect,
  children,
  minCharsToSearch = 1,
  trimQuery = true,
  isLoading = false,
}: SearchableInputProps<T>) {
  const [input, setInput] = useState(value);

  const debounceCtxRef = useRef<DebounceContext>({});

  const timeoutRef = useRef<number | null>(null);

  const lastEmittedQueryRef = useRef<string>("");
  const lastInputValueRef = useRef<string>(value);

  const noResultPrefixRef = useRef<string>("");
  const latestSearchQueryRef = useRef<string>("");

  const normalize = (q: string) => {
    const s = trimQuery ? q.trim() : q;
    return s;
  };

  useEffect(() => {
    if (value !== lastInputValueRef.current) {
      lastInputValueRef.current = value;
      setInput(value);
    }
  }, [value]);

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

  const handleChange = (nextRawValue: string) => {
    if (nextRawValue === lastInputValueRef.current) return;

    lastInputValueRef.current = nextRawValue;
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
      getLabel={getLabel}
      onSelect={onSelect}
      onChange={handleChange}
    >
      {children}
    </SelectableInputDropdown>
  );
}
