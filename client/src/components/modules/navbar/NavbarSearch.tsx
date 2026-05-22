"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Layout, ExternalLink } from "lucide-react";
import Fuse from "fuse.js";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { searchIndex, SearchIndexItem } from "@/constants/searchIndex";
import {
  SelectableInputDropdown,
  SelectableItem,
} from "../../ui/SelectableInputDropdown";
import { cn } from "../../utils";

export const NavbarSearch = () => {
  const router = useRouter();
  const { storeId, navigate } = useStoreNavigation();
  const [query, setQuery] = useState("");

  // Filter index based on whether we are in a store context
  const filteredIndex = useMemo(() => {
    if (storeId) return searchIndex;
    return searchIndex.filter((item) => !item.isStorePage);
  }, [storeId]);

  const fuse = useMemo(() => {
    return new Fuse(filteredIndex, {
      keys: ["title", "description", "keywords", "path"],
      threshold: 0.3,
    });
  }, [filteredIndex]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse
      .search(query)
      .slice(0, 8)
      .map((r) => r.item);
  }, [fuse, query]);

  const handleSelect = (item: SearchIndexItem) => {
    if (item.isStorePage && storeId) {
      navigate(item.path);
    } else if (!item.isStorePage) {
      router.push(item.path);
    }
    setQuery("");
  };

  return (
    <SelectableInputDropdown
      items={results}
      value={query}
      getLabel={(item) => item.title}
      onSelect={handleSelect}
      onChange={setQuery}
      inputProps={{
        placeholder: "Search pages (e.g. dashboard, invoices)...",
        icon: <Search className="w-5 h-5 text-gray-400" />,
        className: "bg-gray-50/50",
      }}
    >
      {(items) =>
        items.map((item, index) => (
          <SelectableItem
            key={item.path}
            item={item}
            index={index}
            className={cn(
              "px-4 py-3  overflow-hidden",
              "w-full flex items-start gap-3 hover:bg-indigo-50 transition-colors",
            )}
          >
            <div className="mt-0.5 p-1.5 bg-gray-100 rounded-lg text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
              {item.isStorePage ? <Layout size={16} /> : <FileText size={16} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.title}
                </p>
                {item.isStorePage && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase tracking-tighter">
                    Store
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {item.description}
              </p>
            </div>
            <ExternalLink size={14} className="text-gray-600 self-center" />
          </SelectableItem>
        ))
      }
    </SelectableInputDropdown>
  );
};
