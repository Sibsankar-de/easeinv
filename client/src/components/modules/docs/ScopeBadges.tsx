"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { SpreadText } from "@/components/ui/SpreadText";
import { ShieldCheck } from "lucide-react";

interface ScopeBadgesProps {
  scopes: string[];
}

export function ScopeBadges({ scopes }: ScopeBadgesProps) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white">
      <div className="bg-slate-50 border-b border-border px-4 py-2 flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
        <SpreadText tracking="widest" className="text-[10px] text-muted-foreground">
          Required Scopes
        </SpreadText>
      </div>
      <div className="px-4 py-3 flex flex-wrap gap-2">
        {scopes.map((scope) => (
          <Badge key={scope} variant="dark" className="font-mono text-[10px]">
            {scope}
          </Badge>
        ))}
      </div>
    </div>
  );
}
