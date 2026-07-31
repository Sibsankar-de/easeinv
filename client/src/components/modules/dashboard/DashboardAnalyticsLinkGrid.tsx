"use client";

import { ArrowRight } from "lucide-react";
import { ElementType } from "react";
import { cn } from "@/components/utils";

export type AnalyticsLink = {
  title: string;
  description: string;
  href: string;
  icon: ElementType;
  color?: string;
};

export const AnalyticsLinkGrid = ({
  links,
  onNavigate,
}: {
  links: AnalyticsLink[];
  onNavigate: (path: string) => void;
}) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
    {links.map((link) => {
      const Icon = link.icon;
      return (
        <button
          key={link.href}
          type="button"
          onClick={() => onNavigate(link.href)}
          className={cn(
            "group cursor-pointer rounded-xl border border-border bg-card p-5 text-left",
            "transition-all duration-200 hover:border-primary/30 hover:bg-accent/30 hover:shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <span
              className={cn(
                "rounded-lg p-2 transition-colors",
                link.color ??
                  "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            {link.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {link.description}
          </p>
        </button>
      );
    })}
  </div>
);
