"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  PaginationState,
  OnChangeFn,
  RowData,
} from "@tanstack/react-table";
import { TableBodySkeleton } from "./Skeleton";
import { Pagination } from "./Pagination";
import { cn } from "../utils";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string;
  }
}

interface DataTableProps<TData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  emptyState?: React.ReactNode;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  pageCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  emptyState,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange,
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: pageCount ?? -1,
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        "px-6 py-4 text-sm font-semibold text-gray-700 group",
                        header.column.getCanSort() &&
                          "cursor-pointer select-none hover:bg-gray-100 transition-colors",
                        header.column.columnDef.meta?.className,
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-2",
                          header.column.columnDef.meta?.className?.includes(
                            "text-center",
                          ) && "justify-center",
                          header.column.columnDef.meta?.className?.includes(
                            "text-right",
                          ) && "justify-end",
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {header.column.getCanSort() && (
                          <div className="w-4 h-4 text-gray-400">
                            {{
                              asc: <ArrowUp className="w-4 h-4" />,
                              desc: <ArrowDown className="w-4 h-4" />,
                            }[header.column.getIsSorted() as string] ?? (
                              <ArrowUpDown className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <TableBodySkeleton columns={columns.length} rows={5} />
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-6 py-4 text-sm text-gray-600",
                          cell.column.columnDef.meta?.className,
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-0">
                    {emptyState}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pageCount !== undefined && pageCount > 1 && (
        <Pagination
          totalPage={pageCount}
          currentPage={(pagination?.pageIndex ?? 0) + 1}
          onPageChange={(page) => {
            if (onPaginationChange) {
              onPaginationChange((prev: PaginationState) => ({
                ...prev,
                pageIndex: page - 1,
              }));
            }
          }}
        />
      )}
    </div>
  );
}
