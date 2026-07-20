"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Users, Eye, Trash2, UserPlus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { pageLimits } from "@/constants/pageLimits";
import {
  fetchCustomerListThunk,
  selectCustomerState,
  clearCustomerListData,
} from "@/store/features/customerSlice";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { EmptyState } from "@/components/ui/EmptyState";
import { DataTable } from "@/components/ui/DataTable";
import { createColumnHelper, SortingState } from "@tanstack/react-table";
import { CustomerDto } from "@/types/dto/customerDto";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/utils";
import { getTableSearchDebounceTime } from "@/utils/get-debounce";
import { CustomerDeleteModal } from "./CustomerDeleteModal";
import { SearchInput } from "@/components/ui/SearchInput";
import { CustomerCreateEditModal } from "./CustomerCreateEditModal";
import { useNavContext } from "@/contexts/NavContext";
import { NavActionButton } from "../navbar/Navbar";

const columnHelper = createColumnHelper<CustomerDto>();

const CustomerActions = ({ customer }: { customer: CustomerDto }) => {
  const { navigate } = useStoreNavigation();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        className="p-2"
        tooltip="View customer"
        onClick={() => navigate(`/customers/${customer.id}`)}
      >
        <Eye className="w-4 h-4" />
      </Button>
      <Button
        variant="danger"
        className="p-2"
        tooltip="Remove customer"
        onClick={() => setIsDeleteOpen(true)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
      <CustomerDeleteModal
        openState={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        customer={customer}
      />
    </div>
  );
};

export const CustomerListTable = () => {
  const { storeId } = useStoreNavigation();
  const { setActionButtons } = useNavContext();
  const dispatch = useDispatch();
  const {
    data: { customerListData },
    status,
  } = useSelector(selectCustomerState);
  const {
    data: { currencySymbol },
  } = useSelector(selectCurrentStoreState);

  const [customerAddModalOpen, setCustomerAddModalOpen] = useState(false);

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
    const trimmed = searchTerm.trim();
    if (trimmed === debouncedSearchTerm) {
      return;
    }
    const delay = getTableSearchDebounceTime(searchTerm, debounceCtx.current);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(trimmed);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      dispatch(clearCustomerListData());
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm, dispatch]);

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
            {currencySymbol}
            {info.getValue() || 0}
          </span>
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: (info) => <CustomerActions customer={info.row.original} />,
        meta: { className: "text-right" },
      }),
    ],
    [currencySymbol],
  );

  const pageData = useMemo(
    () => customerListData.pages[currentPage]?.docs || [],
    [customerListData, currentPage],
  );

  useEffect(() => {
    setActionButtons(
      <NavActionButton onClick={() => setCustomerAddModalOpen(true)}>
        <UserPlus size={15} />
        New Customer
      </NavActionButton>,
    );
  }, [setActionButtons]);

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-4 flex items-center gap-3">
        <SearchInput
          placeholder="Search by name or phone number..."
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
        />
        <Button
          className="whitespace-nowrap"
          onClick={() => setCustomerAddModalOpen(true)}
        >
          <UserPlus size={15} />
          Add customer
        </Button>
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

      <CustomerCreateEditModal
        mode="create"
        openState={customerAddModalOpen}
        onClose={() => setCustomerAddModalOpen(false)}
      />
    </div>
  );
};
