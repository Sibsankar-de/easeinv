import { PrimaryBox } from "@/components/ui/PrimaryBox";
import { ElementType, ReactNode } from "react";

type MetricTone = "primary" | "success" | "info" | "warning" | "danger";

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
}: {
  children: ReactNode;
  columns?: 3 | 4;
}) => (
  <div
    className={`grid grid-cols-1 gap-4 md:grid-cols-3 ${
      columns === 4 ? "xl:grid-cols-4" : ""
    }`}
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
}: {
  label: string;
  value: string;
  helper: string;
  icon: ElementType;
  tone?: MetricTone;
}) => (
  <PrimaryBox>
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <h2 className="mt-1 truncate text-2xl font-medium text-foreground">
          {value}
        </h2>
      </div>
      <span className={`rounded-lg p-2 ${metricToneClass[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
    </div>
    <p className="text-sm text-muted-foreground">{helper}</p>
  </PrimaryBox>
);
