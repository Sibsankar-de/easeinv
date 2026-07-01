import React from "react";
import { Badge } from "./Badge";
import { cn } from "../utils";

interface PageHeaderProps {
  title: React.ReactNode;
  description: React.ReactNode;
  badgeLabel: string;
  badgeIcon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  badgeLabel,
  badgeIcon: BadgeIcon,
  className,
}: PageHeaderProps) {
  return (
    <section 
      className={cn(
        "relative overflow-hidden px-6 lg:px-12 py-20 text-center border-b border-border/40",
        className
      )}
    >
      {/* Ambient background visual elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Badge Pill */}
        <div className="flex justify-center">
          <Badge variant="primary" className="inline-flex items-center gap-1.5 px-3 py-1">
            {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5 text-primary" />}
            {badgeLabel}
          </Badge>
        </div>

        {/* Heading Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
          {title}
        </h1>

        {/* Text Description */}
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      </div>
    </section>
  );
}
