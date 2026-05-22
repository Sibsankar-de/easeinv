"use client";

import { PrimaryBox } from "@/components/ui/PrimaryBox";
import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  fetchInvoiceSummaryThunk,
  selectInvoiceState,
} from "@/store/features/invoiceSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/Skeleton";
import { MetricCard, MetricGrid } from "@/components/ui/MetricCard";
import { ClockAlert, IndianRupee, BookOpenCheck } from "lucide-react";

export const InvoiceSummarySection = () => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const {
    data: { summaryData },
    summaryStatus,
  } = useSelector(selectInvoiceState);

  useEffect(() => {
    if (summaryStatus === "idle") {
      dispatch(fetchInvoiceSummaryThunk({ storeId }));
    }
  }, [dispatch, summaryStatus]);

  if (summaryStatus === "loading") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <PrimaryBox key={i} className="rounded-xl">
            <Skeleton className="h-4 w-32 mb-3" />
            <Skeleton className="h-8 w-24 mb-3" />
            <Skeleton className="h-4 w-20" />
          </PrimaryBox>
        ))}
      </div>
    );
  }

  return (
    <MetricGrid columns={3}>
      <MetricCard
        label="Total Revenue"
        value={String(summaryData.totalRevenue)}
        helper={`${summaryData.totalInvoices} invoices`}
        icon={IndianRupee}
        tone="primary"
      />

      <MetricCard
        label="Total Paid Amount"
        value={String(summaryData.totalPaid)}
        helper={`${summaryData.paidCount} paid invoices`}
        icon={BookOpenCheck}
        tone="success"
      />

      <MetricCard
        label="Total Pending Payment"
        value={String(summaryData.totalDue)}
        helper={`${summaryData.dueCount} pending invoices`}
        icon={ClockAlert}
        tone="danger"
      />
    </MetricGrid>
  );
};
