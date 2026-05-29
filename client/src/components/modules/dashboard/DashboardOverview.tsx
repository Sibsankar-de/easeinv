"use client";

import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  BadgeIndianRupee,
  Boxes,
  ChartNoAxesCombined,
  CreditCard,
} from "lucide-react";
import { AnalyticsLinkGrid } from "./DashboardAnalyticsLinkGrid";
import { ChartCard } from "@/components/charts/DashboardChartCard";
import { DashboardPageHeader } from "./DashboardPageHeader";
import { DashboardSkeleton } from "@/components/ui/DashboardSkeleton";
import { EmptyAnalyticsState } from "./DashboardEmptyState";
import { MetricCard, MetricGrid } from "@/components/ui/MetricCard";
import { RecentInvoicesList } from "./DashboardRecentInvoicesList";
import { CategorySalesPieChart } from "@/components/charts/DashboardCategorySalesPieChart";
import { HorizontalCurrencyBarChart } from "@/components/charts/DashboardHorizontalCurrencyBarChart";
import { SalesTrendAreaChart } from "@/components/charts/DashboardSalesTrendAreaChart";
import { useDashboardAnalytics } from "@/hooks/use-dashboard-analytics";
import { formatCurrency, formatNumber } from "@/utils/currency-formatters";
import { analyticsLinks } from "@/constants/dashboard";
import { useSelector } from "react-redux";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";

export const DashboardOverview = () => {
  const { navigate } = useStoreNavigation();
  const { data, period, isLoading, setPeriod } = useDashboardAnalytics();
  const {
    data: { currentStore },
  } = useSelector(selectCurrentStoreState);
  const currencyCode = currentStore?.currencyCode;

  const hasAnalytics =
    data.kpis.totalInvoices > 0 ||
    data.salesTrend.length > 0 ||
    data.topProducts.length > 0;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Dashboard"
        description="Review sales, billing, product movement, and customer activity."
        period={period}
        onPeriodChange={setPeriod}
      />

      {isLoading ? <DashboardSkeleton /> : null}

      {!isLoading ? (
        <>
          <MetricGrid>
            <MetricCard
              label="Total revenue"
              value={formatCurrency(data.kpis.totalRevenue, currencyCode)}
              helper={`${formatNumber(data.kpis.totalInvoices)} invoices`}
              icon={BadgeIndianRupee}
            />
            <MetricCard
              label="Paid amount"
              value={formatCurrency(data.kpis.totalPaid, currencyCode)}
              helper={`${formatCurrency(data.kpis.totalDue, currencyCode)} pending`}
              icon={CreditCard}
              tone="success"
            />
            <MetricCard
              label="Products sold"
              value={formatNumber(data.kpis.totalProductsSold)}
              helper={`${formatNumber(data.kpis.totalProducts)} products listed`}
              icon={Boxes}
              tone="info"
            />
            <MetricCard
              label="Total profit"
              value={formatCurrency(data.kpis.totalProfit, currencyCode)}
              helper={`${formatNumber(data.kpis.totalCustomers)} customers`}
              icon={ChartNoAxesCombined}
              tone="warning"
            />
          </MetricGrid>

          {!hasAnalytics ? <EmptyAnalyticsState /> : null}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <ChartCard
              title="Sales trend"
              description="Revenue, paid collection, and due movement"
              className="xl:col-span-2"
            >
              <SalesTrendAreaChart
                data={data.salesTrend}
                currencyCode={currencyCode}
              />
            </ChartCard>

            <ChartCard
              title="Category sales"
              description="Revenue split by product category"
            >
              <CategorySalesPieChart
                data={data.categorySales}
                currencyCode={currencyCode}
              />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ChartCard
              title="Top products"
              description="Best-selling products by revenue"
            >
              <HorizontalCurrencyBarChart
                data={data.topProducts}
                dataKey="revenue"
                name="Revenue"
                color="var(--chart-2)"
                currencyCode={currencyCode}
              />
            </ChartCard>

            <ChartCard
              title="Recent invoices"
              description="Latest billing activity in this store"
              heightClassName="h-auto"
            >
              <RecentInvoicesList
                invoices={data.recentInvoices}
                currencyCode={currencyCode}
              />
            </ChartCard>
          </div>

          <AnalyticsLinkGrid links={analyticsLinks} onNavigate={navigate} />
        </>
      ) : null}
    </div>
  );
};
