import { RecentInvoiceAnalytics } from "@/types/DashboardAnalyticsType";
import { Pagination } from "@/components/ui/Pagination";
import { formatDateStr } from "@/utils/formatDate";
import { FileText } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/utils/currency-formatters";
import { EmptyState } from "@/components/ui/EmptyState";

export const RecentInvoicesList = ({
  invoices,
  currencyCode,
}: {
  invoices: RecentInvoiceAnalytics[];
  currencyCode?: string;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;
  const totalPage = Math.max(1, Math.ceil(invoices.length / pageSize));
  const safePage = Math.min(currentPage, totalPage);
  const pageInvoices = invoices.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  if (invoices.length === 0) {
    return (
      <EmptyState
        title="No recent invoices"
        description="New billing activity will appear here."
        className="min-h-52 border-dashed bg-muted/30"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
        {pageInvoices.map((invoice) => {
          const issueDate = formatDateStr(invoice.issueDate);
          const isPending = invoice.dueAmount > 0;

          return (
            <div
              key={invoice._id}
              className="rounded-lg border border-border bg-background px-4 py-3 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {invoice.invoiceNumber}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          isPending
                            ? "bg-destructive/10 text-destructive"
                            : "bg-chart-2/10 text-chart-2"
                        }`}
                      >
                        {isPending ? "Due" : "Paid"}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {invoice.customerName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {issueDate.dateStr}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium text-foreground">
                    {formatCurrency(invoice.total, currencyCode)}
                  </p>
                  <p
                    className={`mt-1 text-xs ${
                      isPending ? "text-destructive" : "text-chart-2"
                    }`}
                  >
                    {isPending
                      ? `${formatCurrency(invoice.dueAmount, currencyCode)} due`
                      : `${formatCurrency(invoice.paidAmount, currencyCode)} paid`}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Pagination
        totalPage={totalPage}
        currentPage={safePage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
