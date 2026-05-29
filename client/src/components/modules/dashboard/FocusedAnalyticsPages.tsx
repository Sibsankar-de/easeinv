"use client";

import {
  BadgeIndianRupee,
  CreditCard,
  FileText,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { AnalyticsPeriod } from "@/types/DashboardAnalyticsType";
import { ChartCard } from "@/components/charts/DashboardChartCard";
import { DashboardPageHeader } from "./DashboardPageHeader";
import { DashboardSkeleton } from "@/components/ui/DashboardSkeleton";
import { DataListRow, PaginatedDataList } from "./DashboardDataList";
import { MetricCard, MetricGrid } from "@/components/ui/MetricCard";
import { CategorySalesPieChart } from "@/components/charts/DashboardCategorySalesPieChart";
import { HorizontalCurrencyBarChart } from "@/components/charts/DashboardHorizontalCurrencyBarChart";
import { InvoiceVolumeBarChart } from "@/components/charts/DashboardInvoiceVolumeBarChart";
import { PaidDueAreaChart } from "@/components/charts/DashboardPaidDueAreaChart";
import {
  PaymentStatusPieChart,
  PaymentStatusDatum,
  } from "@/components/charts/DashboardPaymentStatusPieChart";
  import { RevenueProfitLineChart } from "@/components/charts/DashboardRevenueProfitLineChart";
  import { useDashboardAnalytics } from "@/hooks/use-dashboard-analytics";
  import { formatCurrency, formatNumber } from "@/utils/currency-formatters";
  import { useSelector } from "react-redux";
  import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";


export const SalesAnalyticsPageContent = () => {
  const { data, period, isLoading, setPeriod } = useDashboardAnalytics();
  const {
    data: { currentStore },
  } = useSelector(selectCurrentStoreState);
  const currencyCode = currentStore?.currencyCode;

  const averageInvoice =
    data.kpis.totalInvoices > 0
      ? data.kpis.totalRevenue / data.kpis.totalInvoices
      : 0;
  const profitRate =
    data.kpis.totalRevenue > 0
      ? (data.kpis.totalProfit / data.kpis.totalRevenue) * 100
      : 0;

  return (
    <AnalyticsPageLayout
      title="Sales analytics"
      description="Detailed sales performance, revenue movement, and profitability insights."
      period={period}
      onPeriodChange={setPeriod}
      isLoading={isLoading}
    >
      <MetricGrid columns={3}>
        <MetricCard
          label="Revenue"
          value={formatCurrency(data.kpis.totalRevenue, currencyCode)}
          helper={`${formatNumber(data.kpis.totalInvoices)} invoices`}
          icon={BadgeIndianRupee}
        />
        <MetricCard
          label="Profit"
          value={formatCurrency(data.kpis.totalProfit, currencyCode)}
          helper={`${profitRate.toFixed(1)}% profit rate`}
          icon={TrendingUp}
          tone="success"
        />
        <MetricCard
          label="Average invoice"
          value={formatCurrency(averageInvoice, currencyCode)}
          helper="Revenue per invoice"
          icon={FileText}
          tone="info"
        />
      </MetricGrid>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard
          title="Revenue and profit trend"
          description="Revenue compared with profit over the selected period"
          className="xl:col-span-2"
          heightClassName="h-96"
        >
          <RevenueProfitLineChart
            data={data.salesTrend}
            currencyCode={currencyCode}
          />
        </ChartCard>

        <ChartCard
          title="Invoice volume"
          description="Invoice count by reporting bucket"
          heightClassName="h-96"
        >
          <InvoiceVolumeBarChart data={data.salesTrend} />
        </ChartCard>
      </div>
    </AnalyticsPageLayout>
  );
};

export const BillingAnalyticsPageContent = () => {
  const { data, period, isLoading, setPeriod } = useDashboardAnalytics();
  const {
    data: { currentStore },
  } = useSelector(selectCurrentStoreState);
  const currencyCode = currentStore?.currencyCode;

  const billingStatusData: PaymentStatusDatum[] = [
    { name: "Paid", value: data.billingStatus.paid },
    { name: "Partial", value: data.billingStatus.partial },
    { name: "Unpaid", value: data.billingStatus.unpaid },
  ];
  const collectionRate =
    data.kpis.totalRevenue > 0
      ? (data.kpis.totalPaid / data.kpis.totalRevenue) * 100
      : 0;

  return (
    <AnalyticsPageLayout
      title="Billing analytics"
      description="Detailed billing activity, collection health, and pending payment insights."
      period={period}
      onPeriodChange={setPeriod}
      isLoading={isLoading}
    >
      <MetricGrid columns={3}>
        <MetricCard
          label="Collected"
          value={formatCurrency(data.kpis.totalPaid, currencyCode)}
          helper={`${collectionRate.toFixed(1)}% collection rate`}
          icon={CreditCard}
          tone="success"
        />
        <MetricCard
          label="Outstanding"
          value={formatCurrency(data.kpis.totalDue, currencyCode)}
          helper="Pending customer payments"
          icon={BadgeIndianRupee}
          tone="danger"
        />
        <MetricCard
          label="Invoices"
          value={formatNumber(data.kpis.totalInvoices)}
          helper="Total billing documents"
          icon={FileText}
        />
      </MetricGrid>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard
          title="Paid vs due trend"
          description="Collection and pending balance across the selected period"
          className="xl:col-span-2"
          heightClassName="h-96"
        >
          <PaidDueAreaChart data={data.salesTrend} currencyCode={currencyCode} />
        </ChartCard>

        <ChartCard
          title="Payment status"
          description="Invoice collection status split"
          heightClassName="h-96"
        >
          <PaymentStatusPieChart data={billingStatusData} />
        </ChartCard>
      </div>

      <ChartCard
        title="Recent billing activity"
        description="Latest invoices and their payment state"
        heightClassName="h-auto"
      >
        <PaginatedDataList
          items={data.recentInvoices}
          pageSize={5}
          emptyText="No recent billing activity found"
          renderItem={(invoice) => (
            <DataListRow
              key={invoice._id}
              title={invoice.invoiceNumber}
              detail={invoice.customerName}
              value={formatCurrency(invoice.total, currencyCode)}
              meta={
                invoice.dueAmount > 0
                  ? `${formatCurrency(invoice.dueAmount, currencyCode)} due`
                  : "Paid"
              }
              danger={invoice.dueAmount > 0}
            />
          )}
        />
      </ChartCard>
    </AnalyticsPageLayout>
  );
};

export const ProductAnalyticsPageContent = () => {
  const { data, period, isLoading, setPeriod } = useDashboardAnalytics();
  const {
    data: { currentStore },
  } = useSelector(selectCurrentStoreState);
  const currencyCode = currentStore?.currencyCode;

  return (
    <AnalyticsPageLayout
      title="Product analytics"
      description="Detailed top-product, category, quantity, and inventory movement insights."
      period={period}
      onPeriodChange={setPeriod}
      isLoading={isLoading}
    >
      <MetricGrid columns={3}>
        <MetricCard
          label="Units sold"
          value={formatNumber(data.kpis.totalProductsSold)}
          helper="Total billed quantity"
          icon={Package}
          tone="info"
        />
        <MetricCard
          label="Products listed"
          value={formatNumber(data.kpis.totalProducts)}
          helper="Current catalog size"
          icon={Package}
        />
        <MetricCard
          label="Product revenue"
          value={formatCurrency(data.kpis.totalRevenue, currencyCode)}
          helper="Revenue from billed items"
          icon={BadgeIndianRupee}
          tone="success"
        />
      </MetricGrid>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard
          title="Top product revenue"
          description="Highest revenue products"
          heightClassName="h-96"
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
          title="Category contribution"
          description="Revenue split by category"
          heightClassName="h-96"
        >
          <CategorySalesPieChart
            data={data.categorySales}
            currencyCode={currencyCode}
          />
        </ChartCard>
      </div>

      <ChartCard
        title="Product leaderboard"
        description="Quantity, revenue, and profit by product"
        heightClassName="h-auto"
      >
        <PaginatedDataList
          items={data.topProducts}
          pageSize={5}
          emptyText="No product sales found"
          renderItem={(product) => (
            <DataListRow
              key={product.productId}
              title={product.name}
              detail={`${formatNumber(product.quantitySold)} units sold${
                product.sku ? ` • ${product.sku}` : ""
              }`}
              value={formatCurrency(product.revenue, currencyCode)}
              meta={`${formatCurrency(product.profit, currencyCode)} profit`}
            />
          )}
        />
      </ChartCard>
    </AnalyticsPageLayout>
  );
};

export const CustomerAnalyticsPageContent = () => {
  const { data, period, isLoading, setPeriod } = useDashboardAnalytics();
  const {
    data: { currentStore },
  } = useSelector(selectCurrentStoreState);
  const currencyCode = currentStore?.currencyCode;

  const averageCustomerRevenue =
    data.kpis.totalCustomers > 0
      ? data.kpis.totalRevenue / data.kpis.totalCustomers
      : 0;

  return (
    <AnalyticsPageLayout
      title="Customer analytics"
      description="Detailed customer activity, repeat billing, and outstanding due insights."
      period={period}
      onPeriodChange={setPeriod}
      isLoading={isLoading}
    >
      <MetricGrid columns={3}>
        <MetricCard
          label="Customers"
          value={formatNumber(data.kpis.totalCustomers)}
          helper="Customers in this store"
          icon={Users}
        />
        <MetricCard
          label="Average revenue"
          value={formatCurrency(averageCustomerRevenue, currencyCode)}
          helper="Revenue per customer"
          icon={BadgeIndianRupee}
          tone="success"
        />
        <MetricCard
          label="Customer dues"
          value={formatCurrency(data.kpis.totalDue, currencyCode)}
          helper="Outstanding balance"
          icon={CreditCard}
          tone="danger"
        />
      </MetricGrid>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard
          title="Top customer value"
          description="Customers ranked by billed revenue"
          heightClassName="h-96"
        >
          <HorizontalCurrencyBarChart
            data={data.topCustomers}
            dataKey="totalBilled"
            name="Billed"
            currencyCode={currencyCode}
          />
        </ChartCard>

        <ChartCard
          title="Customer dues"
          description="Outstanding amount by customer"
          heightClassName="h-96"
        >
          <HorizontalCurrencyBarChart
            data={data.topCustomers}
            dataKey="totalDue"
            name="Due"
            color="var(--destructive)"
            currencyCode={currencyCode}
          />
        </ChartCard>
      </div>

      <ChartCard
        title="Customer leaderboard"
        description="Billing, payment, and due details by customer"
        heightClassName="h-auto"
      >
        <PaginatedDataList
          items={data.topCustomers}
          pageSize={5}
          emptyText="No customer analytics found"
          renderItem={(customer) => (
            <DataListRow
              key={customer.customerId}
              title={customer.name}
              detail={`${formatNumber(customer.invoiceCount)} invoices${
                customer.phoneNumber ? ` • ${customer.phoneNumber}` : ""
              }`}
              value={formatCurrency(customer.totalBilled, currencyCode)}
              meta={`${formatCurrency(customer.totalDue, currencyCode)} due`}
              danger={customer.totalDue > 0}
            />
          )}
        />
      </ChartCard>
    </AnalyticsPageLayout>
  );
};

const AnalyticsPageLayout = ({
  title,
  description,
  period,
  onPeriodChange,
  isLoading,
  children,
}: {
  title: string;
  description: string;
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  isLoading: boolean;
  children: ReactNode;
}) => (
  <div className="space-y-6">
    <DashboardPageHeader
      title={title}
      description={description}
      period={period}
      onPeriodChange={onPeriodChange}
    />

    {isLoading ? <DashboardSkeleton metricCount={3} chartHeight="h-96" /> : children}
  </div>
);
