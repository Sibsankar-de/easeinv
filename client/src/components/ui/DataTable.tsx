"use client";

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  PaginationState,
  RowSelectionState,
  OnChangeFn,
  RowData,
  Row,
} from "@tanstack/react-table";
import { TableBodySkeleton } from "./Skeleton";
import { Pagination } from "./Pagination";
import { Select } from "./Select";
import { Checkbox } from "./Checkbox";
import { cn } from "../utils";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string;
  }
}

const PAGE_SIZE_OPTIONS = [
  { key: "10", value: "10" },
  { key: "15", value: "15" },
  { key: "20", value: "20" },
  { key: "50", value: "50" },
  { key: "100", value: "100" },
];

export interface DataTableProps<TData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  onSelectedRowsChange?: (selectedRows: TData[]) => void;
  getRowId?: (originalRow: TData, index: number) => string;
  emptyState?: ReactNode;
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
  enableRowSelection = true,
  rowSelection: controlledRowSelection,
  onRowSelectionChange: controlledOnRowSelectionChange,
  onSelectedRowsChange,
  getRowId,
  emptyState,
}: DataTableProps<TData>) {
  const [internalRowSelection, setInternalRowSelection] =
    useState<RowSelectionState>({});

  const isControlled = controlledRowSelection !== undefined;
  const currentRowSelection = isControlled
    ? controlledRowSelection
    : internalRowSelection;

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> =
    useCallback(
      (updaterOrValue) => {
        const nextSelection =
          typeof updaterOrValue === "function"
            ? updaterOrValue(currentRowSelection)
            : updaterOrValue;

        if (!isControlled) {
          setInternalRowSelection(nextSelection);
        }
        controlledOnRowSelectionChange?.(nextSelection);
      },
      [currentRowSelection, isControlled, controlledOnRowSelectionChange],
    );

  const tableColumns = useMemo(() => {
    if (!enableRowSelection) {
      return columns;
    }

    const hasSelectColumn = columns.some(
      (col) => col.id === "select" || col.id === "selection",
    );

    if (hasSelectColumn) {
      return columns;
    }

    const selectColumn: ColumnDef<TData, unknown> = {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
            aria-label="Select all rows"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={(checked) => row.toggleSelected(!!checked)}
            aria-label={`Select row ${row.index + 1}`}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      meta: {
        className: "w-12 px-3 text-center",
      },
    };

    return [selectColumn, ...columns];
  }, [columns, enableRowSelection]);

  const defaultGetRowId = useCallback(
    (originalRow: TData, index: number) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = originalRow as any;
      return row?.id !== undefined
        ? String(row.id)
        : row?._id !== undefined
          ? String(row._id)
          : String(index);
    },
    [],
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      pagination,
      sorting,
      rowSelection: currentRowSelection,
    },
    enableRowSelection,
    onPaginationChange,
    onSortingChange,
    onRowSelectionChange: handleRowSelectionChange,
    getRowId: getRowId ?? defaultGetRowId,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: pageCount ?? -1,
  });

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (onSelectedRowsChange) {
      const selectedData = table
        .getSelectedRowModel()
        .flatRows.map((row) => row.original);
      onSelectedRowsChange(selectedData);
    }
  }, [currentRowSelection, table, onSelectedRowsChange]);

  const hasData = Boolean(!isLoading && data && data.length > 0);
  const showPagination = Boolean(
    hasData && ((pageCount !== undefined && pageCount > 0) || pagination),
  );

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
                <TableBodySkeleton columns={tableColumns.length} rows={5} />
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "transition-colors",
                      row.getIsSelected()
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "hover:bg-gray-50",
                    )}
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
                  <td colSpan={tableColumns.length} className="p-0">
                    {emptyState}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {pagination && onPaginationChange ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Select
                options={PAGE_SIZE_OPTIONS}
                value={String(pagination.pageSize ?? 10)}
                onChange={(val) => {
                  const newPageSize = Number(val);
                  onPaginationChange((prev: PaginationState) => ({
                    ...prev,
                    pageSize: newPageSize,
                    pageIndex: 0,
                  }));
                }}
                className="w-20"
              />
              <span>/ page</span>
            </div>
          ) : (
            <div />
          )}

          <div>
            {pageCount !== undefined && pageCount > 1 ? (
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
            ) : (
              <div />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
