import { AnalyticsPeriod } from "@/types/DashboardAnalyticsType";
import { PeriodSelector } from "./DashboardPeriodSelector";

export const DashboardPageHeader = ({
  title,
  description,
  period,
  onPeriodChange,
}: {
  title: string;
  description: string;
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
}) => (
  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
    <div>
      <h1 className="mb-2 text-foreground text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>

    <PeriodSelector period={period} onPeriodChange={onPeriodChange} />
  </div>
);
