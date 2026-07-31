"use client";

// DashboardPeriodSelector is superseded by DateRangePicker.
// This file is kept to avoid breaking any remaining imports.
// New code should use <DateRangePicker> from @/components/ui/DateRangePicker.

import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { AnalyticsFilterState } from "@/types/AnalyticsTypes";

export const PeriodSelector = ({
  filter,
  onFilterChange,
}: {
  filter: AnalyticsFilterState;
  onFilterChange: (filter: AnalyticsFilterState) => void;
}) => <DateRangePicker value={filter} onChange={onFilterChange} />;
