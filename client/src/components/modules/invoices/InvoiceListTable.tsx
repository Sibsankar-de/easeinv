"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Pen,
  Eye,
  Download,
  FileCheck,
  FileClock,
  Trash2,
  PrinterCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInvoiceListThunk,
  selectInvoiceState,
  invalidateInvoicePages,
} from "@/store/features/invoiceSlice";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { Badge } from "@/components/ui/Badge";
import { InvoiceStatus, InvoiceSummaryDto } from "@/types/dto/invoiceDto";
import { pageLimits } from "@/constants/pageLimits";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterSelector } from "@/components/ui/FilterSelector";
import { SelectOptionType } from "@/types/SelectType";
import { DataTable } from "@/components/ui/DataTable";
import { createColumnHelper, SortingState } from "@tanstack/react-table";
import { formatDateStr } from "@/utils/formatDate";
import { InvoiceDueEditModal } from "./InvoiceDueEditModal";
import { InvoiceViewModal } from "./InvoiceViewModal";
import { InvoiceDeleteModal } from "./InvoiceDeleteModal";
import { getTableSearchDebounceTime } from "@/utils/get-debounce";
import { cn } from "@/components/utils";
import { SearchInput } from "@/components/ui/SearchInput";
import { useInvoiceDownload } from "@/hooks/use-invoice-download";
import { ExportButton } from "@/components/ui/ExportButton";
import { downloadExportFile } from "@/utils/export-utils";
import { Tabs, TabItem } from "@/components/ui/Tabs";

const invoiceTabs: TabItem[] = [
  { id: InvoiceStatus.ISSUED, label: "Issued Invoices", icon: FileCheck },
  { id: InvoiceStatus.DRAFTED, label: "Draft Invoices", icon: FileClock },
];

const paymentFilterOptions: SelectOptionType[] = [
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
  const { navigate } = useStoreNavigation();
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { isDownloading, downloadInvoice, hiddenInvoiceComponent } =
    useInvoiceDownload();

  const isDraft = invoice.status === InvoiceStatus.DRAFTED;

  const handleEditClick = () => {
    if (isDraft) {
      navigate(`billing?invoice=${invoice.id}`);
    } else {
      setEditOpen(true);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1 relative">
      <Button
        variant="outline"
        className="p-2 text-primary"
        tooltip={isDraft ? "Edit draft" : "Update due"}
        onClick={handleEditClick}
      >
        <Pen className="w-4 h-4" />
      </Button>
      {isDraft ? (
        <Button
          variant="outline"
          className="p-2 text-primary"
          tooltip="Issue & print"
          onClick={() => setViewOpen(true)}
        >
          <PrinterCheck className="w-4 h-4" />
        </Button>
      ) : (
        <Button
          variant="outline"
          className="p-2"
          tooltip="View or print"
          onClick={() => setViewOpen(true)}
        >
          <Eye className="w-4 h-4" />
        </Button>
      )}
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

      {isDraft && (
        <Button
          variant="danger"
          className="p-2"
          tooltip="Delete draft"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}

      {hiddenInvoiceComponent}

      {!isDraft && (
        <InvoiceDueEditModal
          openState={editOpen}
          invoice={invoice}
          page={page}
          onClose={() => setEditOpen(false)}
        />
      )}

      {isDraft && (
        <InvoiceDeleteModal
          openState={deleteOpen}
          invoice={invoice}
          onClose={() => setDeleteOpen(false)}
        />
      )}

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

  const [activeTab, setActiveTab] = useState<string>(InvoiceStatus.ISSUED);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageLimits.INVOICE_LIST,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const debounceCtx = React.useRef({ lastInputAt: 0, lastValueLength: 0 });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "issueDate", desc: true },
  ]);
  const [isExporting, setIsExporting] = useState(false);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setPaymentFilter("all");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    dispatch(invalidateInvoicePages());
  };

  const handleExport = async (format: "xlsx" | "csv") => {
    setIsExporting(true);
    const sortField = sorting[0]?.id || "createdAt";
    const sortOrder = sorting[0]?.desc ? "desc" : "asc";

    const isPaymentStatusFilter =
      activeTab === InvoiceStatus.ISSUED &&
      (paymentFilter === "PAID" ||
        paymentFilter === "DUE" ||
        paymentFilter === "OVERDUE");

    await downloadExportFile({
      endpoint: `/invoices/${storeId}/export`,
      params: {
        format,
        query: debouncedSearchTerm || undefined,
        status: activeTab,
        paymentStatus: isPaymentStatusFilter ? paymentFilter : undefined,
        customerId: customerId || undefined,
        sortBy: sortField,
        sortOrder,
      },
      defaultFilename: `${activeTab.toLowerCase()}_invoices_${storeId}_${new Date().toISOString().slice(0, 10)}.${format}`,
      format,
    });
    setIsExporting(false);
  };

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

      const isPaymentStatusFilter =
        activeTab === InvoiceStatus.ISSUED &&
        (paymentFilter === "PAID" ||
          paymentFilter === "DUE" ||
          paymentFilter === "OVERDUE");

      dispatch(
        fetchInvoiceListThunk({
          storeId,
          page: currentPage,
          limit: pagination.pageSize,
          status: activeTab,
          paymentStatus: isPaymentStatusFilter ? paymentFilter : undefined,
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
    activeTab,
    paymentFilter,
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
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const isIssued = status === InvoiceStatus.ISSUED;
          return (
            <Badge variant={isIssued ? "primary" : "secondary"}>
              {isIssued ? "Issued" : "Draft"}
            </Badge>
          );
        },
        meta: { className: "text-center" },
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
    <div className="space-y-4">
      {/* Tabs Selector for Issued vs Draft */}
      <Tabs
        tabs={invoiceTabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        className="mb-4"
      />

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="w-full lg:w-72 xl:w-80">
          <SearchInput
            placeholder={
              activeTab === InvoiceStatus.ISSUED
                ? "Search issued invoices or customer..."
                : "Search draft invoices or customer..."
            }
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2.5 justify-end">
          {activeTab === InvoiceStatus.ISSUED && (
            <FilterSelector
              options={paymentFilterOptions}
              value={paymentFilter}
              onChange={(val) => {
                setPaymentFilter(val);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                dispatch(invalidateInvoicePages());
              }}
              className="w-full"
            />
          )}
          <ExportButton onExport={handleExport} loading={isExporting} />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={pageData}
        isLoading={invoiceFetchStatus === "loading"}
        pageCount={invoicePagedData.totalPages}
        pagination={pagination}
        onPaginationChange={(updater) => {
          const next =
            typeof updater === "function" ? updater(pagination) : updater;
          if (next.pageSize !== pagination.pageSize) {
            dispatch(invalidateInvoicePages());
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
          dispatch(invalidateInvoicePages());
        }}
        emptyState={
          <EmptyState
            icon={<FileText className="w-8 h-8 text-gray-400" />}
            title={
              activeTab === InvoiceStatus.ISSUED
                ? "No issued invoices found"
                : "No draft invoices found"
            }
            description={
              activeTab === InvoiceStatus.ISSUED
                ? "Issued invoices will appear here once created."
                : "Draft bills you're working on will appear here."
            }
          />
        }
      />
    </div>
  );
};
