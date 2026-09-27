import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { Button } from "@/components/ui/Button";
import { AnalyticsFilterState } from "@/types/AnalyticsTypes";
import { RefreshCw } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/components/utils";

export const DashboardPageHeader = ({
  title,
  description,
  filter,
  onFilterChange,
  onRefresh,
  isLoading = false,
  actions,
}: {
  title: string;
  description: string;
  filter: AnalyticsFilterState;
  onFilterChange: (filter: AnalyticsFilterState) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  actions?: ReactNode;
}) => (
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <h1 className="mb-1.5 text-foreground text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>

    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto lg:ml-auto lg:flex-nowrap">
      {actions}
      {onRefresh && (
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={isLoading}
          tooltip="Refresh"
          tooltipId="refresh-tooltip"
          className="p-2 h-[38px] w-[38px] rounded-full justify-center items-center shrink-0"
        >
          <RefreshCw
            className={cn("h-4 w-4 text-foreground", isLoading && "animate-spin")}
          />
        </Button>
      )}
      <div className="flex-1 min-w-0 lg:flex-none">
        <DateRangePicker value={filter} onChange={onFilterChange} />
      </div>
    </div>
  </div>
);
