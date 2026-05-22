import { PrimaryBox } from "@/components/ui/PrimaryBox";
import { Skeleton } from "@/components/ui/Skeleton";

export const DashboardSkeleton = ({
  metricCount = 4,
  chartHeight = "h-80",
}: {
  metricCount?: number;
  chartHeight?: string;
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: metricCount }).map((_, index) => (
        <PrimaryBox key={index}>
          <Skeleton className="mb-3 h-4 w-28" />
          <Skeleton className="mb-3 h-8 w-36" />
          <Skeleton className="h-4 w-24" />
        </PrimaryBox>
      ))}
    </div>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <PrimaryBox className="xl:col-span-2">
        <Skeleton className="mb-4 h-5 w-32" />
        <Skeleton className={`${chartHeight} w-full`} />
      </PrimaryBox>
      <PrimaryBox>
        <Skeleton className="mb-4 h-5 w-32" />
        <Skeleton className={`${chartHeight} w-full`} />
      </PrimaryBox>
    </div>
  </div>
);
