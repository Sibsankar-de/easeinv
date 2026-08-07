"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { FileText, Pen, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInvoiceListThunk,
  selectInvoiceState,
  invalidateInvoicePages,
} from "@/store/features/invoiceSlice";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { InvoiceSummaryDto } from "@/types/dto/invoiceDto";
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
import { useInvoiceDownload } from "@/hooks/use-invoice-download";

const filterOptions: SelectOptionType[] = [
  { value: "All", key: "all" },
  { value: "Paid", key: "PAID" },
  { value: "Due", key: "DUE" },
  { value: "Overdue", key: "OVERDUE" },
];

const columnHelper = createColumnHelper<InvoiceSummaryDto>();

const InvoiceActions = ({
  invoice,
  page,
}: {
  invoice: InvoiceSummaryDto;
  page: number;
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const { isDownloading, downloadInvoice, hiddenInvoiceComponent } =
    useInvoiceDownload();

  return (
    <div className="flex items-center justify-end gap-1 relative">
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
      <Button
        variant="outline"
        className="p-2"
        tooltip={isDownloading ? "Downloading..." : "Download"}
        onClick={() => downloadInvoice(invoice)}
        disabled={isDownloading}
        loading={isDownloading}
      >
        <Download className="w-4 h-4" />
      </Button>

      {hiddenInvoiceComponent}

      <InvoiceDueEditModal
        openState={editOpen}
        invoice={invoice}
        page={page}
        onClose={() => setEditOpen(false)}
      />

      <InvoiceViewModal
        openState={viewOpen}
        invoice={invoice}
        fetchInvoice={true}
        onClose={() => setViewOpen(false)}
      />
    </div>
  );
};

export const InvoiceListTable = ({ customerId }: { customerId?: string }) => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const {
    data: { invoicePagedData },
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
      dispatch(invalidateInvoicePages());
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm, dispatch]);

  useEffect(() => {
    if (!invoicePagedData.pages[currentPage]) {
      const sortField = sorting[0]?.id;
      const sortOrder = sorting[0]?.desc ? "desc" : "asc";

      dispatch(
        fetchInvoiceListThunk({
          storeId,
          page: currentPage,
          limit: pagination.pageSize,
          paymentStatus: filterStatus !== "all" ? filterStatus : undefined,
          query: debouncedSearchTerm || undefined,
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
    invoicePagedData.pages,
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
      columnHelper.accessor("customer.name", {
        header: "Customer",
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
    () => invoicePagedData.pages[currentPage]?.docs || [],
    [invoicePagedData, currentPage],
  );

  return (
    <div>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
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
            dispatch(invalidateInvoicePages());
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={pageData}
        isLoading={invoiceFetchStatus === "loading"}
        pageCount={invoicePagedData.totalPages}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={(updater) => {
          const nextState =
            typeof updater === "function" ? updater(sorting) : updater;
          setSorting(nextState);
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          dispatch(invalidateInvoicePages());
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
