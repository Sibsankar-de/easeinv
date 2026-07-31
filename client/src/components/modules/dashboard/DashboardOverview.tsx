"use client";

import { useStoreNavigation } from "@/hooks/store-navigation";
import { useDashboardSummary } from "@/hooks/use-dashboard-summary";
import { formatCurrency, formatNumber } from "@/utils/currency-formatters";
import { analyticsLinks } from "@/constants/dashboard";
import { useSelector } from "react-redux";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import {
  BadgeIndianRupee,
  BarChart3,
  Boxes,
  CreditCard,
  FileText,
  Percent,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { AnalyticsLinkGrid } from "./DashboardAnalyticsLinkGrid";
import { DashboardPageHeader } from "./DashboardPageHeader";
import { DashboardSkeleton } from "@/components/ui/DashboardSkeleton";
import { MetricCard, MetricGrid } from "@/components/ui/MetricCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { PrimaryBox } from "@/components/ui/PrimaryBox";

export const DashboardOverview = () => {
  const { navigate } = useStoreNavigation();
  const { data, filter, isLoading, setFilter, refetch } = useDashboardSummary();
  const {
    data: { currentStore },
  } = useSelector(selectCurrentStoreState);
  const currencyCode = currentStore?.currencyCode;

  const kpis = data?.kpis;

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Dashboard"
        description="Store-wide performance summary for the selected period."
        filter={filter}
        onFilterChange={setFilter}
        onRefresh={refetch}
        isLoading={isLoading}
      />

      {isLoading ? (
        <>
          <DashboardSkeleton metricCount={4} layout="summary" />
          <DashboardSkeleton metricCount={4} layout="summary" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <PrimaryBox key={i} className="space-y-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3.5 w-36" />
              </PrimaryBox>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Row 1: Revenue metrics */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Revenue
            </p>
            <MetricGrid columns={4}>
              <MetricCard
                label="Total revenue"
                value={formatCurrency(kpis?.totalRevenue ?? 0, currencyCode)}
                helper={
                  filter.mode === "custom" && filter.startDate && filter.endDate
                    ? `${filter.startDate} → ${filter.endDate}`
                    : `This ${filter.period} period`
                }
                icon={BadgeIndianRupee}
                tone="primary"
              />
              <MetricCard
                label="Amount paid"
                value={formatCurrency(kpis?.paidAmount ?? 0, currencyCode)}
                helper="Collected from customers"
                icon={CreditCard}
                tone="success"
              />
              <MetricCard
                label="Amount due"
                value={formatCurrency(kpis?.dueAmount ?? 0, currencyCode)}
                helper="Pending from customers"
                icon={Wallet}
                tone="danger"
              />
              <MetricCard
                label="Total profit"
                value={formatCurrency(kpis?.totalProfit ?? 0, currencyCode)}
                helper={`${(kpis?.profitMargin ?? 0).toFixed(1)}% profit margin`}
                icon={TrendingUp}
                tone="warning"
              />
            </MetricGrid>
          </div>

          {/* Row 2: Activity metrics */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Activity
            </p>
            <MetricGrid columns={4}>
              <MetricCard
                label="Total invoices"
                value={formatNumber(kpis?.totalInvoices ?? 0)}
                helper="Billing documents issued"
                icon={FileText}
                tone="info"
              />
              <MetricCard
                label="Products sold"
                value={formatNumber(kpis?.productsSold ?? 0)}
                helper="Total units billed"
                icon={Boxes}
                tone="info"
              />
              <MetricCard
                label="Avg invoice value"
                value={formatCurrency(kpis?.averageInvoiceValue ?? 0, currencyCode)}
                helper="Revenue per invoice"
                icon={BarChart3}
                tone="primary"
              />
              <MetricCard
                label="Profit margin"
                value={`${(kpis?.profitMargin ?? 0).toFixed(1)}%`}
                helper={formatCurrency(kpis?.totalProfit ?? 0, currencyCode) + " net profit"}
                icon={Percent}
                tone="warning"
              />
            </MetricGrid>
          </div>

          {/* Navigation cards */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Detailed analytics
            </p>
            <AnalyticsLinkGrid links={analyticsLinks} onNavigate={navigate} />
          </div>
        </>
      )}
    </div>
  );
};
