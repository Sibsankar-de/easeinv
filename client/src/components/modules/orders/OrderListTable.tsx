"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ShoppingBag,
  Eye,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { pageLimits } from "@/constants/pageLimits";
import {
  fetchOrderListThunk,
  selectOrderState,
  invalidateOrderPages,
} from "@/store/features/orderSlice";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { EmptyState } from "@/components/ui/EmptyState";
import { DataTable } from "@/components/ui/DataTable";
import { createColumnHelper, SortingState } from "@tanstack/react-table";
import { OrderStatus, OrderSummaryDto } from "@/types/dto/orderDto";
import { Button } from "@/components/ui/Button";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { getTableSearchDebounceTime } from "@/utils/get-debounce";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { SelectOptionType } from "@/types/SelectType";
import { formatDateStr } from "@/utils/formatDate";
import { OrderStatusChangeModal } from "./OrderStatusChangeModal";
import { OrderDeleteModal } from "./OrderDeleteModal";
import { AppDispatch } from "@/store/store";
import Link from "next/link";

const statusFilterOptions: SelectOptionType[] = [
  { key: OrderStatus.PENDING, value: "Pending" },
  { key: OrderStatus.PROCESSING, value: "Processing" },
  { key: OrderStatus.DISPATCHED, value: "Dispatched" },
  { key: OrderStatus.COMPLETED, value: "Completed" },
  { key: OrderStatus.REJECTED, value: "Rejected" },
  { key: "all", value: "All Orders" },
];

const columnHelper = createColumnHelper<OrderSummaryDto>();

const OrderActions = ({ order }: { order: OrderSummaryDto }) => {
  const { storeId, navigate } = useStoreNavigation();
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const isCompleted = order.status === OrderStatus.COMPLETED;

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        variant="outline"
        className="p-2 text-primary hover:text-primary-hover"
        tooltip="Change status"
        onClick={() => setIsStatusModalOpen(true)}
      >
        <SlidersHorizontal className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        className="p-2 text-gray-700 hover:text-gray-900"
        tooltip="View order details"
        onClick={() => navigate(`/orders/${order.id}`)}
      >
        <Eye className="w-4 h-4" />
      </Button>

      {!isCompleted && (
        <Button
          variant="danger"
          className="p-2"
          tooltip="Delete order"
          onClick={() => setIsDeleteOpen(true)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}

      <OrderStatusChangeModal
        openState={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        order={order}
      />

      <OrderDeleteModal
        openState={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        order={order}
      />
    </div>
  );
};

export const OrderListTable = () => {
  const { storeId, navigate } = useStoreNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const {
    data: { orderPagedData },
    status,
  } = useSelector(selectOrderState);

  const {
    data: { currencySymbol },
  } = useSelector(selectCurrentStoreState);

  const [statusFilter, setStatusFilter] = useState<string>(OrderStatus.PENDING);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageLimits.ORDER_LIST,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const debounceCtx = React.useRef({ lastInputAt: 0, lastValueLength: 0 });

  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  // Debounced search handling
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (trimmed === debouncedSearchTerm) {
      return;
    }
    const delay = getTableSearchDebounceTime(searchTerm, debounceCtx.current);
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(trimmed);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      dispatch(invalidateOrderPages());
    }, delay);

    return () => clearTimeout(handler);
  }, [searchTerm, debouncedSearchTerm, dispatch]);

  const currentPage = pagination.pageIndex + 1;

  const pageData = useMemo(() => {
    return orderPagedData.pages[currentPage]?.docs || [];
  }, [orderPagedData, currentPage]);

  useEffect(() => {
    if (!orderPagedData.pages[currentPage]) {
      const sortField = sorting[0]?.id || "createdAt";
      const sortOrder = sorting[0]?.desc ? "desc" : "asc";

      const statusParam = statusFilter === "all" ? undefined : statusFilter;

      dispatch(
        fetchOrderListThunk({
          storeId,
          page: currentPage,
          limit: pagination.pageSize,
          status: statusParam,
          query: debouncedSearchTerm || undefined,
          sortBy: sortField,
          sortOrder,
        }),
      );
    }
  }, [
    currentPage,
    pagination.pageSize,
    storeId,
    statusFilter,
    debouncedSearchTerm,
    sorting,
    orderPagedData.pages,
    dispatch,
  ]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("orderNumber", {
        header: "Order #",
        cell: (info) => {
          const order = info.row.original;
          return (
            <Link
              href={`/stores/${storeId}/orders/${order.id}`}
              className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0 opacity-70" />
              <span>#{info.getValue()}</span>
            </Link>
          );
        },
      }),
      columnHelper.accessor("customer", {
        header: "Customer",
        cell: (info) => {
          const customer = info.getValue();
          if (!customer) {
            return <span className="text-gray-400 italic">Guest Customer</span>;
          }
          return (
            <div>
              <div className="font-medium text-gray-900">{customer.name}</div>
              {customer.phoneNumber && (
                <div className="text-xs text-gray-500">{customer.phoneNumber}</div>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("orderDate", {
        header: "Order Date",
        cell: (info) => (
          <span className="text-gray-600 text-sm whitespace-nowrap">
            {formatDateStr(info.getValue()).dateStr}
          </span>
        ),
      }),
      columnHelper.accessor("subtotal", {
        header: "Subtotal",
        cell: (info) => (
          <span className="text-gray-600 text-sm">
            {currencySymbol}
            {info.getValue()?.toFixed(2)}
          </span>
        ),
      }),
      columnHelper.accessor("totalAmount", {
        header: "Total Amount",
        cell: (info) => (
          <span className="font-semibold text-gray-900 text-sm">
            {currencySymbol}
            {info.getValue()?.toFixed(2)}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <OrderStatusBadge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="w-full text-right">Actions</div>,
        cell: (info) => <OrderActions order={info.row.original} />,
      }),
    ],
    [storeId, currencySymbol],
  );

  const isLoading = status === "loading";

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <SearchInput
            placeholder="Search by order # or customer..."
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-48">
            <Select
              options={statusFilterOptions}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                dispatch(invalidateOrderPages());
              }}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <DataTable
        columns={columns}
        data={pageData}
        isLoading={isLoading}
        pageCount={orderPagedData.totalPages}
        pagination={pagination}
        onPaginationChange={(updater) => {
          const next =
            typeof updater === "function" ? updater(pagination) : updater;
          if (next.pageSize !== pagination.pageSize) {
            dispatch(invalidateOrderPages());
            setPagination({ ...next, pageIndex: 0 });
          } else {
            setPagination(next);
          }
        }}
        sorting={sorting}
        onSortingChange={(updater) => {
          const nextState =
            typeof updater === "function" ? updater(sorting) : updater;
          setSorting(nextState);
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          dispatch(invalidateOrderPages());
        }}
        emptyState={
          <EmptyState
            icon={<ShoppingBag className="w-8 h-8 text-gray-400" />}
            title="No orders found"
            description={
              debouncedSearchTerm || statusFilter !== "all"
                ? "Try adjusting your search or status filter to find orders."
                : "Orders placed by customers will appear here."
            }
          />
        }
      />
    </div>
  );
};
