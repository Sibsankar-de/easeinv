"use client";

import React from "react";
import {
  ChevronDown,
  Package,
  Users,
  Receipt,
  Tag,
  LucideIcon,
} from "lucide-react";
import { cn } from "../../utils";
import { SpreadText } from "../../ui/SpreadText";
import {
  ApiEndpoint,
  ApiCollection,
  ENDPOINT_COLLECTIONS,
} from "@/lib/api-explorer/endpoints";

const collectionIcons: Record<ApiCollection, LucideIcon> = {
  products: Package,
  categories: Tag,
  customers: Users,
  invoices: Receipt,
};

const methodColors: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-700",
  POST: "bg-blue-100 text-blue-700",
  PATCH: "bg-orange-100 text-orange-700",
  DELETE: "bg-rose-100 text-rose-700",
};

interface CollectionAccordionProps {
  endpoints: ApiEndpoint[];
  activeEndpointId: string;
  onSelectEndpoint: (id: string) => void;
}

export function CollectionAccordion({
  endpoints,
  activeEndpointId,
  onSelectEndpoint,
}: CollectionAccordionProps) {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>(
    Object.fromEntries(ENDPOINT_COLLECTIONS.map((c) => [c.key, true])),
  );

  const toggle = (col: string) => {
    setExpanded((prev) => ({ ...prev, [col]: !prev[col] }));
  };

  return (
    <div className="space-y-2.5">
      {ENDPOINT_COLLECTIONS.map((grp) => {
        const isOpen = expanded[grp.key];
        const groupEndpoints = endpoints.filter(
          (ep) => ep.collection === grp.key,
        );
        if (groupEndpoints.length === 0) return null;
        const Icon = collectionIcons[grp.key];

        return (
          <div
            key={grp.key}
            className={cn(
              "border border-slate-200/80 rounded-xl",
              "overflow-hidden bg-white shadow-sm transition-all",
            )}
          >
            <button
              onClick={() => toggle(grp.key)}
              className={cn(
                "w-full flex items-center justify-between p-3.5",
                "bg-slate-50/50 hover:bg-slate-50 transition-colors text-left",
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-slate-500" />
                <SpreadText tracking="wide" className="text-xs text-slate-700">
                  {grp.title}
                </SpreadText>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-slate-400 transition-transform duration-200",
                  isOpen && "transform rotate-180",
                )}
              />
            </button>

            {isOpen && (
              <div className="p-1.5 space-y-0.5 bg-white border-t border-slate-100">
                {groupEndpoints.map((ep) => {
                  const isSelected = activeEndpointId === ep.id;
                  // Shorten path for display: strip /api/v1 prefix
                  const displayPath = ep.path.replace(/^\/api\/v1/, "");
                  return (
                    <button
                      key={ep.id}
                      onClick={() => onSelectEndpoint(ep.id)}
                      className={cn(
                        "w-full flex items-center gap-2 p-2.5 rounded-lg text-left transition-all",
                        isSelected
                          ? "bg-indigo-50/70 border-l-4 border-indigo-600"
                          : "hover:bg-slate-50 border-l-4 border-transparent",
                      )}
                    >
                      <span
                        className={cn(
                          "text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider shrink-0",
                          methodColors[ep.method] ?? "bg-slate-100 text-slate-700",
                        )}
                      >
                        {ep.method}
                      </span>
                      <span
                        className={cn(
                          "text-[11px] font-mono truncate",
                          isSelected
                            ? "text-indigo-900 font-semibold"
                            : "text-slate-600",
                        )}
                      >
                        {displayPath}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
