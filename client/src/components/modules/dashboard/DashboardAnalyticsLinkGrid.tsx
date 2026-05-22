"use client";

import { ArrowRight } from "lucide-react";
import { ElementType } from "react";

export type AnalyticsLink = {
  title: string;
  description: string;
  href: string;
  icon: ElementType;
};

export const AnalyticsLinkGrid = ({
  links,
  onNavigate,
}: {
  links: AnalyticsLink[];
  onNavigate: (path: string) => void;
}) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    {links.map((link) => {
      const Icon = link.icon;
      return (
        <button
          key={link.href}
          type="button"
          onClick={() => onNavigate(link.href)}
          className="group rounded-lg border border-border bg-card p-5 text-left transition-colors hover:border-primary/30 hover:bg-accent/30"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-lg bg-muted p-2 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </div>
          <h3 className="text-base font-medium text-foreground">{link.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {link.description}
          </p>
        </button>
      );
    })}
  </div>
);
