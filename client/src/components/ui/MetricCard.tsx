import { PrimaryBox } from "@/components/ui/PrimaryBox";
import { ElementType, ReactNode } from "react";
import { cn } from "@/components/utils";

export type MetricTone = "primary" | "success" | "info" | "warning" | "danger";

const metricToneClass: Record<MetricTone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-chart-2/10 text-chart-2",
  info: "bg-chart-3/10 text-chart-3",
  warning: "bg-chart-4/10 text-chart-4",
  danger: "bg-destructive/10 text-destructive",
};

export const MetricGrid = ({
  children,
  columns = 4,
  className,
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) => (
  <div
    className={cn(
      "grid grid-cols-1 gap-4",
      columns === 2 && "md:grid-cols-2",
      columns === 3 && "md:grid-cols-3",
      columns === 4 && "md:grid-cols-2 xl:grid-cols-4",
      className,
    )}
  >
    {children}
  </div>
);

export const MetricCard = ({
  label,
  value,
  helper,
  icon: Icon,
  tone = "primary",
  className,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ElementType;
  tone?: MetricTone;
  className?: string;
}) => (
  <PrimaryBox
    className={cn(
      "group transition-shadow duration-200 hover:shadow-sm",
      className,
    )}
  >
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <h2 className="mt-1.5 truncate text-2xl font-semibold text-foreground">
          {value}
        </h2>
      </div>
      <span
        className={cn(
          "rounded-lg p-2.5 transition-colors",
          metricToneClass[tone],
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed">{helper}</p>
  </PrimaryBox>
);
