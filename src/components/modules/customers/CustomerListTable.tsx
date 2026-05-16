"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Search, Users, Eye, Download } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useDispatch, useSelector } from "react-redux";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { pageLimits } from "@/constants/pageLimits";
import {
  fetchCustomerListThunk,
  selectCustomerState,
  clearCustomerListData,
} from "@/store/features/customerSlice";
import { EmptyState } from "@/components/ui/EmptyState";
import { DataTable } from "@/components/ui/DataTable";
import { createColumnHelper, SortingState } from "@tanstack/react-table";
import { CustomerDto } from "@/types/dto/customerDto";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/utils";
import { getTableSearchDebounceTime } from "@/utils/get-debounce";

const columnHelper = createColumnHelper<CustomerDto>();

export const CustomerListTable = () => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const {
    data: { customerListData },
    status,
  } = useSelector(selectCustomerState);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageLimits.CUSTOMER_LIST,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const debounceCtx = React.useRef({ lastInputAt: 0, lastValueLength: 0 });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const currentPage = pagination.pageIndex + 1;

  // Debounce effect
  useEffect(() => {
    const delay = getTableSearchDebounceTime(searchTerm, debounceCtx.current);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      dispatch(clearCustomerListData());
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, dispatch]);

  useEffect(() => {
    if (!customerListData.pages[currentPage]) {
      const sortField = sorting[0]?.id;
      const sortOrder = sorting[0]?.desc ? "desc" : "asc";

      dispatch(
        fetchCustomerListThunk({
          storeId,
          page: currentPage,
          limit: pagination.pageSize,
          query: debouncedSearchTerm || undefined,
          sortBy: sortField,
          sortOrder,
        }),
      );
    }
  }, [
    dispatch,
    storeId,
    currentPage,
    pagination.pageSize,
    customerListData.pages,
    debouncedSearchTerm,
    sorting,
  ]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "sno",
        header: "Sno",
        enableSorting: false,
        cell: (info) => (
          <span className="text-primary">{info.row.index + 1}</span>
        ),
        meta: { className: "text-left w-16" },
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <span className="text-gray-900">{info.getValue()}</span>
        ),
        meta: { className: "text-left" },
      }),
      columnHelper.accessor("address", {
        header: "Address",
        enableSorting: false,
        cell: (info) => (
          <span
            className={cn(info.getValue() ? "text-gray-900" : "text-gray-400")}
          >
            {info.getValue() || "Not provided"}
          </span>
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.accessor("phoneNumber", {
        header: "Phone number",
        enableSorting: false,
        cell: (info) => (
          <span
            className={cn(info.getValue() ? "text-gray-900" : "text-gray-400")}
          >
            {info.getValue() || "Not provided"}
          </span>
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.accessor("totalInvoices", {
        header: "Total Invoices",
        cell: (info) => (
          <span className="text-gray-900">{info.getValue() || 0}</span>
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.accessor("totalDue", {
        header: "Total Due",
        cell: (info) => (
          <span className={info.getValue() ? "text-red-400" : "text-gray-900"}>
            &#8377;{info.getValue() || 0}
          </span>
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: () => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="none"
              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="none"
              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        ),
        meta: { className: "text-right" },
      }),
    ],
    [],
  );

  const pageData = useMemo(
    () => customerListData.pages[currentPage]?.docs || [],
    [customerListData, currentPage],
  );

  return (
    <div>
      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or phone number..."
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
            className="pl-10"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={pageData}
        isLoading={status === "loading"}
        pageCount={customerListData.totalPages}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={(updater) => {
          const nextState =
            typeof updater === "function" ? updater(sorting) : updater;
          setSorting(nextState);
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          dispatch(clearCustomerListData());
        }}
        emptyState={
          <EmptyState
            icon={<Users className="w-8 h-8 text-gray-400" />}
            title="No customers found"
            description="Start adding customers to manage their invoices and track their due amounts."
          />
        }
      />
    </div>
  );
};
