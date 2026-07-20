import { cn } from "../utils";

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div className={cn("animate-pulse rounded-md bg-gray-200", className)} />
  );
};

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableBodySkeleton = ({
  rows = 5,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-gray-100 last:border-0">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-6 py-4">
              <Skeleton
                className={cn("h-4", colIndex === 0 ? "w-8" : "w-full")}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export const TableSkeleton = ({
  rows = 5,
  columns = 5,
  className,
}: TableSkeletonProps) => {
  return (
    <div className={cn("w-full overflow-hidden", className)}>
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-4">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <TableBodySkeleton rows={rows} columns={columns} />
        </tbody>
      </table>
    </div>
  );
};

export const StoreCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border p-5 border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4.5 w-14 rounded-full" />
            <Skeleton className="h-4.5 w-16 rounded-md" />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
            <Skeleton className="h-3.5 w-32 shrink-0" />
            <Skeleton className="h-3.5 w-36 shrink-0" />
            <Skeleton className="h-3.5 w-24 shrink-0" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 pt-4 sm:pt-0 border-t sm:border-none border-gray-50 justify-end w-full sm:w-auto">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    </div>
  );
};

export const FormSkeleton = ({ rows = 4 }: { rows?: number }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center gap-6">
      <Skeleton className="w-20 h-20 rounded-full shrink-0" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-6 w-48 mb-2.5" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded-full shrink-0" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </div>
  );
};
