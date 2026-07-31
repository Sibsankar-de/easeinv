import { PrimaryBox } from "@/components/ui/PrimaryBox";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/components/utils";

type DashboardSkeletonLayout = "summary" | "analytics";

export const DashboardSkeleton = ({
  metricCount = 4,
  chartHeight = "h-80",
  layout = "analytics",
}: {
  metricCount?: number;
  chartHeight?: string;
  layout?: DashboardSkeletonLayout;
}) => (
  <div className="space-y-6">
    {/* Metric cards */}
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        metricCount <= 3 ? "md:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4",
      )}
    >
      {Array.from({ length: metricCount }).map((_, index) => (
        <PrimaryBox key={index} className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-7 w-32" />
            </div>
            <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
          </div>
          <Skeleton className="h-3.5 w-28" />
        </PrimaryBox>
      ))}
    </div>

    {/* Charts — only shown for analytics layout */}
    {layout === "analytics" && (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <PrimaryBox className="xl:col-span-2 space-y-4">
          <div className="space-y-1">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3.5 w-48" />
          </div>
          <Skeleton className={cn(chartHeight, "w-full")} />
        </PrimaryBox>
        <PrimaryBox className="space-y-4">
          <div className="space-y-1">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3.5 w-40" />
          </div>
          <Skeleton className={cn(chartHeight, "w-full")} />
        </PrimaryBox>
      </div>
    )}
  </div>
);
