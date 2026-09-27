"use client";

import React from "react";
import { ApiParam } from "@/lib/api-explorer/endpoints";
import { Input } from "@/components/ui/Input";
import { SpreadText } from "@/components/ui/SpreadText";

interface QueryParamInputsProps {
  params?: ApiParam[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export function QueryParamInputs({
  params,
  values,
  onChange,
}: QueryParamInputsProps) {
  if (!params || params.length === 0) {
    return (
      <div className="p-4 bg-slate-50 border border-border rounded-xl text-center">
        <span className="text-xs text-muted-foreground font-medium">
          No query parameters for this endpoint.
        </span>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white">
      <div className="bg-slate-50 border-b border-border px-4 py-2">
        <SpreadText tracking="widest" className="text-[10px] text-muted-foreground">
          Query Parameters
        </SpreadText>
      </div>
      <div className="p-3 divide-y divide-slate-100">
        {params.map((p) => (
          <div key={p.name} className="py-3 flex items-start gap-4">
            <div className="w-2/5 flex flex-col font-mono shrink-0">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                {p.name}
                {p.required && (
                  <span
                    className="h-1.5 w-1.5 bg-rose-500 rounded-full"
                    title="Required"
                  />
                )}
              </span>
              <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                {p.type}
              </span>
              <span className="text-[10px] text-slate-500 leading-relaxed mt-1 font-sans font-normal">
                {p.desc}
              </span>
            </div>
            <div className="flex-1">
              <Input
                value={values[p.name] || ""}
                onChange={(v) => onChange(p.name, v)}
                placeholder={`Optional`}
                className="font-mono text-xs h-8"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
