"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { FileText, Pen, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInvoiceListThunk,
  selectInvoiceState,
  clearInvoiceList,
} from "@/store/features/invoiceSlice";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { InvoiceDto } from "@/types/dto/invoiceDto";
import { pageLimits } from "@/constants/pageLimits";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterSelector } from "@/components/ui/FilterSelector";
import { SelectOptionType } from "@/types/SelectType";
import { DataTable } from "@/components/ui/DataTable";
import { createColumnHelper, SortingState } from "@tanstack/react-table";
import { formatDateStr } from "@/utils/formatDate";
import { InvoiceDueEditModal } from "./InvoiceDueEditModal";
import { InvoiceViewModal } from "./InvoiceViewModal";
import { getTableSearchDebounceTime } from "@/utils/get-debounce";
import { cn } from "@/components/utils";
import { SearchInput } from "@/components/ui/SearchInput";

const filterOptions: SelectOptionType[] = [
  { value: "All", key: "all" },
  { value: "Paid", key: "paid" },
  { value: "Unpaid", key: "unpaid" },
  { value: "Overdue", key: "overdue" },
];

const columnHelper = createColumnHelper<InvoiceDto>();

const InvoiceActions = ({
  invoice,
  page,
}: {
  invoice: InvoiceDto;
  page: number;
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="outline"
        className="p-2 text-primary"
        tooltip="Update due"
        onClick={() => setEditOpen(true)}
      >
        <Pen className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        className="p-2"
        tooltip="View or print"
        onClick={() => setViewOpen(true)}
      >
        <Eye className="w-4 h-4" />
      </Button>
      <Button variant="outline" className="p-2" tooltip="Download">
        <Download className="w-4 h-4" />
      </Button>

      <InvoiceDueEditModal
        openState={editOpen}
        invoice={invoice}
        page={page}
        onClose={() => setEditOpen(false)}
      />

      <InvoiceViewModal
        openState={viewOpen}
        invoice={invoice}
        onClose={() => setViewOpen(false)}
      />
    </div>
  );
};

export const InvoiceListTable = ({ customerId }: { customerId?: string }) => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const {
    data: { invoiceListData },
    status: invoiceFetchStatus,
  } = useSelector(selectInvoiceState);
  const {
    data: { currencySymbol },
  } = useSelector(selectCurrentStoreState);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageLimits.INVOICE_LIST,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const debounceCtx = React.useRef({ lastInputAt: 0, lastValueLength: 0 });
  const [filterStatus, setFilterStatus] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "issueDate", desc: true },
  ]);

  const currentPage = pagination.pageIndex + 1;

  // Debounce effect
  useEffect(() => {
    if (searchTerm === debouncedSearchTerm) {
      return;
    }
    const delay = getTableSearchDebounceTime(searchTerm, debounceCtx.current);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      dispatch(clearInvoiceList());
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm, dispatch]);

  useEffect(() => {
    if (!invoiceListData.pages[currentPage]) {
      const sortField = sorting[0]?.id;
      const sortOrder = sorting[0]?.desc ? "desc" : "asc";

      dispatch(
        fetchInvoiceListThunk({
          storeId,
          page: currentPage,
          limit: pagination.pageSize,
          status: filterStatus !== "all" ? filterStatus : undefined,
          customerPrefix: debouncedSearchTerm || undefined,
          customerId,
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
    filterStatus,
    invoiceListData.pages,
    debouncedSearchTerm,
    sorting,
    customerId,
  ]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("invoiceNumber", {
        header: "Invoice Number",
        cell: (info) => (
          <span className="text-indigo-600 font-medium">{info.getValue()}</span>
        ),
        meta: { className: "text-left" },
      }),
      columnHelper.accessor("customerDetails.name", {
        header: "Customer",
        cell: (info) => (
          <span
            className={cn(info.getValue() ? "text-gray-900" : "text-gray-400")}
          >
            {info.getValue() || "Not provided"}
          </span>
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.accessor("issueDate", {
        header: "Date",
        cell: (info) => (
          <span className="text-gray-900">
            {formatDateStr(info.getValue()).dashedDate}
          </span>
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.accessor("total", {
        header: "Total",
        cell: (info) => (
          <span className="text-gray-900 font-medium">
            {currencySymbol}
            {info.getValue()}
          </span>
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.accessor("dueAmount", {
        header: "Due",
        cell: (info) => (
          <span
            className={
              info.getValue()
                ? "text-red-400 font-medium"
                : "text-green-600 font-medium"
            }
          >
            {currencySymbol}
            {info.getValue()}
          </span>
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: (info) => (
          <InvoiceActions invoice={info.row.original} page={currentPage} />
        ),
        meta: { className: "text-right" },
      }),
    ],
    [currentPage, currencySymbol],
  );

  const pageData = useMemo(
    () => invoiceListData.pages[currentPage]?.docs || [],
    [invoiceListData, currentPage],
  );

  return (
    <div>
      {/* Search and Filters */}
      <div className="flex items-center gap-3 mb-4">
        <SearchInput
          placeholder="Search by invoice number or client name..."
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
        />
        <FilterSelector
          options={filterOptions}
          value={filterStatus}
          onChange={(val) => {
            setFilterStatus(val);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            dispatch(clearInvoiceList());
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={pageData}
        isLoading={invoiceFetchStatus === "loading"}
        pageCount={invoiceListData.totalPages}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={(updater) => {
          const nextState =
            typeof updater === "function" ? updater(sorting) : updater;
          setSorting(nextState);
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          dispatch(clearInvoiceList());
        }}
        emptyState={
          <EmptyState
            icon={<FileText className="w-8 h-8 text-gray-400" />}
            title="No invoices found"
            description="Create your first invoice to start tracking your sales and payments."
          />
        }
      />
    </div>
  );
};
