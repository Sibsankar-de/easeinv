"use client";

import React from "react";
import { ApiParam } from "@/lib/api-explorer/endpoints";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { SpreadText } from "@/components/ui/SpreadText";

interface PathParamInputsProps {
  params: ApiParam[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export function PathParamInputs({
  params,
  values,
  onChange,
}: PathParamInputsProps) {
  if (params.length === 0) return null;

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white">
      <div className="bg-slate-50 border-b border-border px-4 py-2">
        <SpreadText
          tracking="widest"
          className="text-[10px] text-muted-foreground"
        >
          Path Parameters
        </SpreadText>
      </div>
      <div className="p-3 space-y-3">
        {params.map((p) => (
          <div key={p.name} className="space-y-1">
            <Label className="flex items-center gap-1.5 font-mono text-xs text-slate-700 mb-0">
              {p.name}
              <span className="h-1.5 w-1.5 bg-rose-500 rounded-full" title="Required" />
            </Label>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-1">
              {p.desc}
            </p>
            <Input
              value={values[p.name] || ""}
              onChange={(v) => onChange(p.name, v)}
              placeholder={`Enter ${p.name}`}
              className="font-mono text-xs h-8"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
