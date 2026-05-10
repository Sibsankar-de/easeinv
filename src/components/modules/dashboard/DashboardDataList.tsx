"use client";

import { Pagination } from "@/components/ui/Pagination";
import { ReactNode, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";

export const DataList = ({ children }: { children: ReactNode }) => (
  <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
    {children}
  </div>
);

export const PaginatedDataList = <T,>({
  items,
  pageSize = 5,
  maxHeightClassName = "max-h-80",
  emptyText = "No records found",
  renderItem,
}: {
  items: T[];
  pageSize?: number;
  maxHeightClassName?: string;
  emptyText?: string;
  renderItem: (item: T) => ReactNode;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPage = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(currentPage, totalPage);
  const start = (safePage - 1) * pageSize;
  const currentItems = items.slice(start, start + pageSize);

  if (items.length === 0) {
    return (
      <EmptyState
        title={emptyText}
        className="min-h-40 border-dashed bg-muted/30"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className={`${maxHeightClassName} overflow-y-auto pr-1`}>
        <DataList>{currentItems.map((item) => renderItem(item))}</DataList>
      </div>
      <Pagination
        totalPage={totalPage}
        currentPage={safePage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export const DataListRow = ({
  title,
  detail,
  value,
  meta,
  danger = false,
  icon,
}: {
  title: string;
  detail: string;
  value: string;
  meta: string;
  danger?: boolean;
  icon?: ReactNode;
}) => (
  <div className="flex items-center justify-between gap-4 px-4 py-3">
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        {icon}
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
      </div>
      <p className="mt-1 truncate text-sm text-muted-foreground">{detail}</p>
    </div>
    <div className="text-right">
      <p className="text-sm font-medium text-foreground">{value}</p>
      <p className={`text-xs ${danger ? "text-destructive" : "text-chart-2"}`}>
        {meta}
      </p>
    </div>
  </div>
);
