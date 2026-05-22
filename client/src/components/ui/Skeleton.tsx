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
    <div className="bg-white rounded-lg border p-6 border-gray-200 flex justify-between items-baseline">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div>
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-24 mb-2" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-28 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
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
    <div className="p-6">
      <div className="flex items-start gap-6">
        <Skeleton className="w-[100px] h-[100px] rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div>
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
