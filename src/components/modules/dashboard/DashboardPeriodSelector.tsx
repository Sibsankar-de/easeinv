"use client";

import { Button } from "@/components/ui/Button";
import { AnalyticsPeriod } from "@/types/DashboardAnalyticsType";
import { CalendarDays } from "lucide-react";
import { analyticsPeriodOptions } from "@/constants/dashboard";

export const PeriodSelector = ({
  period,
  onPeriodChange,
}: {
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
}) => {
  return (
    <div className="flex w-fit items-center gap-1 rounded-lg border border-border bg-card p-1">
      {analyticsPeriodOptions.map((option) => (
        <Button
          key={option.value}
          variant="none"
          onClick={() => onPeriodChange(option.value)}
          className={`rounded-md px-4 py-2 text-sm ${
            period === option.value
              ? "bg-primary text-primary-foreground hover:brightness-100"
              : "text-muted-foreground hover:bg-accent/50"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          {option.label}
        </Button>
      ))}
    </div>
  );
};
