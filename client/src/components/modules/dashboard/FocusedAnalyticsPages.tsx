"use client";

import {
  BadgeIndianRupee,
  BarChart3,
  Boxes,
  CheckCircle,
  CreditCard,
  FileText,
  LayoutGrid,
  Percent,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { ChartCard } from "@/components/charts/DashboardChartCard";
import { DashboardPageHeader } from "./DashboardPageHeader";
import { DashboardSkeleton } from "@/components/ui/DashboardSkeleton";
import { MetricCard, MetricGrid } from "@/components/ui/MetricCard";
import { PrimaryBox } from "@/components/ui/PrimaryBox";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/utils";

import { useSalesAnalytics } from "@/hooks/use-sales-analytics";
import { useProductAnalytics } from "@/hooks/use-product-analytics";
import { useCustomerAnalytics } from "@/hooks/use-customer-analytics";
import { useCategoryAnalytics } from "@/hooks/use-category-analytics";

import { formatCurrency, formatNumber } from "@/utils/currency-formatters";
import { useSelector } from "react-redux";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import {
  AnalyticsFilterState,
  ProductAnalyticsFilter,
  CustomerAnalyticsFilter,
  CategoryAnalyticsFilter,
  SalesTrendPoint,
  ProductTrendPoint,
  CustomerTrendPoint,
  CategoryTrendPoint,
} from "@/types/AnalyticsTypes";

import {
  dashboardChartDueColor,
  dashboardChartPaidColor,
  dashboardChartProfitColor,
  dashboardChartRevenueColor,
  dashboardChartVolumeColor,
  dashboardChartColors,
} from "@/constants/dashboard";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Currency-aware tooltip formatters ────────────────────────────────────────
const makeCurrencyFormatter =
  (currencyCode?: string) =>
  (value: any): string =>
    formatCurrency(Number(value ?? 0), currencyCode);

// ─── Shared layout wrapper ────────────────────────────────────────────────────
const AnalyticsPageLayout = ({
  title,
  description,
  filter,
  onFilterChange,
  onRefresh,
  isLoading,
  children,
  actions,
}: {
  title: string;
  description: string;
  filter: AnalyticsFilterState;
  onFilterChange: (f: AnalyticsFilterState) => void;
  onRefresh?: () => void;
  isLoading: boolean;
  children: ReactNode;
  actions?: ReactNode;
}) => (
  <div className="space-y-6">
    <DashboardPageHeader
      title={title}
      description={description}
      filter={filter}
      onFilterChange={onFilterChange}
      onRefresh={onRefresh}
      isLoading={isLoading}
      actions={actions}
    />
    {isLoading ? (
      <DashboardSkeleton metricCount={3} chartHeight="h-80" layout="analytics" />
    ) : (
      children
    )}
  </div>
);

// ─── Count selector (10 / 25 / 50) ───────────────────────────────────────────
const CountSelector = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) => (
  <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
    {[10, 25, 50].map((n) => (
      <Button
        key={n}
        variant="none"
        onClick={() => onChange(n)}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm",
          value === n
            ? "bg-primary text-primary-foreground hover:brightness-100"
            : "text-muted-foreground hover:bg-accent/50",
        )}
      >
        Top {n}
      </Button>
    ))}
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
const AnalyticsEmptyState = ({ message = "No data available for this period." }: { message?: string }) => (
  <PrimaryBox className="flex flex-col items-center justify-center py-16 text-center">
    <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground/40" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </PrimaryBox>
);

// ─── Period date display ──────────────────────────────────────────────────────
const PeriodBadge = ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
  if (!startDate || !endDate) return null;
  const fmt = (s: string) =>
    new Date(s).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  return (
    <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs text-muted-foreground">
      {fmt(startDate)} – {fmt(endDate)}
    </span>
  );
};

// ─── Recharts common axis props ───────────────────────────────────────────────
const axisStyle = { fontSize: 11, fill: "var(--muted-foreground)" };

// ─── SALES ANALYTICS PAGE ─────────────────────────────────────────────────────
export const SalesAnalyticsPageContent = () => {
  const { data, filter, isLoading, setFilter, refetch } = useSalesAnalytics();
  const {
    data: { currentStore },
  } = useSelector(selectCurrentStoreState);
  const currencyCode = currentStore?.currencyCode;
  const fmtCurrency = makeCurrencyFormatter(currencyCode);

  const summary = data?.summary;
  const trends: SalesTrendPoint[] = data?.trends ?? [];

  return (
    <AnalyticsPageLayout
      title="Sales analytics"
      description="Detailed sales performance, revenue movement, and profitability insights."
      filter={filter}
      onFilterChange={setFilter}
      onRefresh={refetch}
      isLoading={isLoading}
    >
      {/* KPI Row */}
      <MetricGrid columns={3}>
        <MetricCard
          label="Total revenue"
          value={formatCurrency(summary?.totalRevenue ?? 0, currencyCode)}
          helper={`${formatNumber(summary?.totalInvoices ?? 0)} invoices`}
          icon={BadgeIndianRupee}
          tone="primary"
        />
        <MetricCard
          label="Total profit"
          value={formatCurrency(summary?.totalProfit ?? 0, currencyCode)}
          helper={`${summary?.totalRevenue ? (((summary.totalProfit) / summary.totalRevenue) * 100).toFixed(1) : "0"}% profit rate`}
          icon={TrendingUp}
          tone="success"
        />
        <MetricCard
          label="Avg invoice value"
          value={formatCurrency(summary?.averageRevenuePerInvoice ?? 0, currencyCode)}
          helper="Revenue per billing document"
          icon={FileText}
          tone="info"
        />
      </MetricGrid>

      <MetricGrid columns={3}>
        <MetricCard
          label="Amount paid"
          value={formatCurrency(summary?.totalPaid ?? 0, currencyCode)}
          helper={`${(summary?.paymentCollectionRate ?? 0).toFixed(1)}% collection rate`}
          icon={CreditCard}
          tone="success"
        />
        <MetricCard
          label="Amount due"
          value={formatCurrency(summary?.totalDue ?? 0, currencyCode)}
          helper="Outstanding from customers"
          icon={Wallet}
          tone="danger"
        />
        <MetricCard
          label="Total invoices"
          value={formatNumber(summary?.totalInvoices ?? 0)}
          helper="Billing documents issued"
          icon={FileText}
          tone="primary"
        />
      </MetricGrid>

      {/* Charts */}
      {trends.length === 0 ? (
        <AnalyticsEmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <ChartCard
              title="Revenue & profit trend"
              description="Revenue compared with profit over the selected period"
              className="xl:col-span-2"
              heightClassName="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={axisStyle} />
                  <YAxis tick={axisStyle} tickFormatter={(v) => fmtCurrency(v)} width={80} />
                  <Tooltip formatter={fmtCurrency} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={dashboardChartRevenueColor}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    name="Profit"
                    stroke={dashboardChartProfitColor}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Invoice volume"
              description="Invoice count per reporting bucket"
              heightClassName="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={axisStyle} />
                  <YAxis tick={axisStyle} />
                  <Tooltip />
                  <Bar dataKey="invoiceCount" name="Invoices" fill={dashboardChartVolumeColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard
            title="Paid vs due trend"
            description="Collection and outstanding balance across the selected period"
            heightClassName="h-72"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesPaid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={dashboardChartPaidColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={dashboardChartPaidColor} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="salesDue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={dashboardChartDueColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={dashboardChartDueColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={axisStyle} />
                <YAxis tick={axisStyle} tickFormatter={(v) => fmtCurrency(v)} width={80} />
                <Tooltip formatter={fmtCurrency} />
                <Legend />
                <Area type="monotone" dataKey="paid" name="Paid" stroke={dashboardChartPaidColor} fill="url(#salesPaid)" strokeWidth={2} />
                <Area type="monotone" dataKey="due" name="Due" stroke={dashboardChartDueColor} fill="url(#salesDue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}

      {/* Date range footer */}
      {data && (
        <div className="flex justify-end">
          <PeriodBadge startDate={data.startDate} endDate={data.endDate} />
        </div>
      )}
    </AnalyticsPageLayout>
  );
};

// ─── BILLING ANALYTICS PAGE (uses Sales API) ──────────────────────────────────
export const BillingAnalyticsPageContent = () => {
  const { data, filter, isLoading, setFilter } = useSalesAnalytics();
  const {
    data: { currentStore },
  } = useSelector(selectCurrentStoreState);
  const currencyCode = currentStore?.currencyCode;
  const fmtCurrency = makeCurrencyFormatter(currencyCode);

  const summary = data?.summary;
  const trends: SalesTrendPoint[] = data?.trends ?? [];

  return (
    <AnalyticsPageLayout
      title="Billing analytics"
      description="Billing activity, collection health, and outstanding payment insights."
      filter={filter}
      onFilterChange={setFilter}
      isLoading={isLoading}
    >
      <MetricGrid columns={3}>
        <MetricCard
          label="Collected"
          value={formatCurrency(summary?.totalPaid ?? 0, currencyCode)}
          helper={`${(summary?.paymentCollectionRate ?? 0).toFixed(1)}% collection rate`}
          icon={CheckCircle}
          tone="success"
        />
        <MetricCard
          label="Outstanding"
          value={formatCurrency(summary?.totalDue ?? 0, currencyCode)}
          helper="Pending customer payments"
          icon={BadgeIndianRupee}
          tone="danger"
        />
        <MetricCard
          label="Total invoices"
          value={formatNumber(summary?.totalInvoices ?? 0)}
          helper="Billing documents issued"
          icon={FileText}
          tone="primary"
        />
      </MetricGrid>

      {/* Collection rate highlight */}
      <PrimaryBox className="flex items-center gap-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-chart-2/30 bg-chart-2/10">
          <span className="text-xl font-bold text-chart-2">
            {(summary?.paymentCollectionRate ?? 0).toFixed(0)}%
          </span>
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">Payment collection rate</p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatCurrency(summary?.totalPaid ?? 0, currencyCode)} collected out of{" "}
            {formatCurrency(summary?.totalRevenue ?? 0, currencyCode)} billed
          </p>
        </div>
      </PrimaryBox>

      {trends.length === 0 ? (
        <AnalyticsEmptyState />
      ) : (
        <>
          <ChartCard
            title="Paid vs due trend"
            description="Collection and pending balance across the selected period"
            heightClassName="h-80"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="billPaid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={dashboardChartPaidColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={dashboardChartPaidColor} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="billDue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={dashboardChartDueColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={dashboardChartDueColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={axisStyle} />
                <YAxis tick={axisStyle} tickFormatter={(v) => fmtCurrency(v)} width={80} />
                <Tooltip formatter={fmtCurrency} />
                <Legend />
                <Area type="monotone" dataKey="paid" name="Paid" stroke={dashboardChartPaidColor} fill="url(#billPaid)" strokeWidth={2} />
                <Area type="monotone" dataKey="due" name="Due" stroke={dashboardChartDueColor} fill="url(#billDue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Invoice volume"
            description="Number of invoices per reporting period"
            heightClassName="h-64"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip />
                <Bar dataKey="invoiceCount" name="Invoices" fill={dashboardChartVolumeColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}

      {data && (
        <div className="flex justify-end">
          <PeriodBadge startDate={data.startDate} endDate={data.endDate} />
        </div>
      )}
    </AnalyticsPageLayout>
  );
};

// ─── PRODUCT ANALYTICS PAGE ───────────────────────────────────────────────────
export const ProductAnalyticsPageContent = () => {
  const { data, filter, isLoading, setFilter, refetch } = useProductAnalytics();
  const {
    data: { currentStore },
  } = useSelector(selectCurrentStoreState);
  const currencyCode = currentStore?.currencyCode;
  const fmtCurrency = makeCurrencyFormatter(currencyCode);

  const summary = data?.summary;
  const topProducts = data?.topProducts ?? [];
  const trends: ProductTrendPoint[] = data?.trends ?? [];

  const handleCountChange = (n: number) => {
    setFilter({ ...filter, productCount: n } as ProductAnalyticsFilter);
  };

  return (
    <AnalyticsPageLayout
      title="Product analytics"
      description="Top-performing products, category contribution, and sales quantity insights."
      filter={filter}
      onFilterChange={(f) => setFilter({ ...filter, ...f } as ProductAnalyticsFilter)}
      onRefresh={refetch}
      isLoading={isLoading}
      actions={
        <CountSelector
          value={(filter as ProductAnalyticsFilter).productCount ?? 10}
          onChange={handleCountChange}
        />
      }
    >
      <MetricGrid columns={3}>
        <MetricCard
          label="Units sold"
          value={formatNumber(summary?.totalQuantitySold ?? 0)}
          helper="Total billed quantity"
          icon={Boxes}
          tone="info"
        />
        <MetricCard
          label="Product revenue"
          value={formatCurrency(summary?.totalRevenue ?? 0, currencyCode)}
          helper="Revenue from billed items"
          icon={BadgeIndianRupee}
          tone="success"
        />
        <MetricCard
          label="Avg profit margin"
          value={`${(summary?.averageProfitMargin ?? 0).toFixed(1)}%`}
          helper={`${summary?.totalUniqueProductsSold ?? 0} unique products sold`}
          icon={Percent}
          tone="warning"
        />
      </MetricGrid>

      {trends.length === 0 && topProducts.length === 0 ? (
        <AnalyticsEmptyState />
      ) : (
        <>
          {/* Trend charts */}
          {trends.length > 0 && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ChartCard
                title="Quantity sold trend"
                description="Units billed per reporting period"
                heightClassName="h-72"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="prodQty" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={dashboardChartVolumeColor} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={dashboardChartVolumeColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={axisStyle} />
                    <YAxis tick={axisStyle} />
                    <Tooltip />
                    <Area type="monotone" dataKey="quantitySold" name="Units" stroke={dashboardChartVolumeColor} fill="url(#prodQty)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Revenue trend"
                description="Product revenue across the selected period"
                heightClassName="h-72"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={axisStyle} />
                    <YAxis tick={axisStyle} tickFormatter={(v) => fmtCurrency(v)} width={80} />
                    <Tooltip formatter={fmtCurrency} />
                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke={dashboardChartRevenueColor} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="profit" name="Profit" stroke={dashboardChartProfitColor} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}

          {/* Top products horizontal bar */}
          {topProducts.length > 0 && (
            <ChartCard
              title="Top products by revenue"
              description="Best-selling products ranked by billed revenue"
              heightClassName={`h-${Math.max(64, topProducts.slice(0, 10).length * 36 + 60)}px`}
              className="overflow-hidden"
            >
              <ResponsiveContainer width="100%" height={Math.max(256, topProducts.slice(0, 10).length * 36 + 60)}>
                <BarChart
                  data={topProducts.slice(0, 10).map((p) => ({ ...p, name: p.productName }))}
                  layout="vertical"
                  margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={axisStyle} tickFormatter={(v) => fmtCurrency(v)} />
                  <YAxis type="category" dataKey="name" tick={axisStyle} width={130} />
                  <Tooltip formatter={fmtCurrency} />
                  <Bar dataKey="revenue" name="Revenue" fill={dashboardChartRevenueColor} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Product table */}
          {topProducts.length > 0 && (
            <PrimaryBox>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Product leaderboard</h2>
                  <p className="text-sm text-muted-foreground">Ranked by revenue</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="pb-3 text-left font-medium">#</th>
                      <th className="pb-3 text-left font-medium">Product</th>
                      <th className="pb-3 text-left font-medium">SKU</th>
                      <th className="pb-3 text-right font-medium">Units</th>
                      <th className="pb-3 text-right font-medium">Revenue</th>
                      <th className="pb-3 text-right font-medium">Profit</th>
                      <th className="pb-3 text-right font-medium">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, i) => (
                      <tr key={p.productId} className="border-b border-border/50 last:border-0 hover:bg-accent/20 transition-colors">
                        <td className="py-3 pr-4 text-muted-foreground">{i + 1}</td>
                        <td className="py-3 pr-4 font-medium text-foreground">{p.productName}</td>
                        <td className="py-3 pr-4 text-muted-foreground font-mono text-xs">{p.productSku || "—"}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">{formatNumber(p.quantitySold)}</td>
                        <td className="py-3 pr-4 text-right tabular-nums font-medium">{formatCurrency(p.revenue, currencyCode)}</td>
                        <td className="py-3 pr-4 text-right tabular-nums text-chart-2">{formatCurrency(p.profit, currencyCode)}</td>
                        <td className="py-3 text-right tabular-nums">
                          <span className={cn("rounded-md px-1.5 py-0.5 text-xs font-medium", p.profitMargin >= 20 ? "bg-chart-2/10 text-chart-2" : p.profitMargin >= 10 ? "bg-chart-4/10 text-chart-4" : "bg-destructive/10 text-destructive")}>
                            {p.profitMargin.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PrimaryBox>
          )}
        </>
      )}

      {data && (
        <div className="flex justify-end">
          <PeriodBadge startDate={data.startDate} endDate={data.endDate} />
        </div>
      )}
    </AnalyticsPageLayout>
  );
};

// ─── CUSTOMER ANALYTICS PAGE ──────────────────────────────────────────────────
export const CustomerAnalyticsPageContent = () => {
  const { data, filter, isLoading, setFilter, refetch } = useCustomerAnalytics();
  const {
    data: { currentStore },
  } = useSelector(selectCurrentStoreState);
  const currencyCode = currentStore?.currencyCode;
  const fmtCurrency = makeCurrencyFormatter(currencyCode);

  const summary = data?.summary;
  const topCustomers = data?.topCustomers ?? [];
  const trends: CustomerTrendPoint[] = data?.trends ?? [];

  const handleCountChange = (n: number) => {
    setFilter({ ...filter, customerCount: n } as CustomerAnalyticsFilter);
  };

  return (
    <AnalyticsPageLayout
      title="Customer analytics"
      description="Customer activity, repeat billing, and outstanding due insights."
      filter={filter}
      onFilterChange={(f) => setFilter({ ...filter, ...f } as CustomerAnalyticsFilter)}
      onRefresh={refetch}
      isLoading={isLoading}
      actions={
        <CountSelector
          value={(filter as CustomerAnalyticsFilter).customerCount ?? 10}
          onChange={handleCountChange}
        />
      }
    >
      <MetricGrid columns={3}>
        <MetricCard
          label="Total billed"
          value={formatCurrency(summary?.totalBilled ?? 0, currencyCode)}
          helper={`${formatNumber(summary?.totalInvoices ?? 0)} total invoices`}
          icon={BadgeIndianRupee}
          tone="primary"
        />
        <MetricCard
          label="Amount paid"
          value={formatCurrency(summary?.totalPaid ?? 0, currencyCode)}
          helper={`${(summary?.paymentCollectionRate ?? 0).toFixed(1)}% collection rate`}
          icon={CreditCard}
          tone="success"
        />
        <MetricCard
          label="Amount due"
          value={formatCurrency(summary?.totalDue ?? 0, currencyCode)}
          helper="Outstanding balance"
          icon={Wallet}
          tone="danger"
        />
      </MetricGrid>

      <MetricGrid columns={3}>
        <MetricCard
          label="Unique customers"
          value={formatNumber(summary?.totalUniqueCustomers ?? 0)}
          helper="Customers with activity"
          icon={Users}
          tone="info"
        />
        <MetricCard
          label="Avg bill per customer"
          value={formatCurrency(summary?.averageBillPerCustomer ?? 0, currencyCode)}
          helper="Revenue per unique customer"
          icon={BarChart3}
          tone="primary"
        />
        <MetricCard
          label="Collection rate"
          value={`${(summary?.paymentCollectionRate ?? 0).toFixed(1)}%`}
          helper="Paid / billed"
          icon={Percent}
          tone="success"
        />
      </MetricGrid>

      {trends.length === 0 && topCustomers.length === 0 ? (
        <AnalyticsEmptyState />
      ) : (
        <>
          {trends.length > 0 && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ChartCard
                title="Billed vs paid vs due"
                description="Payment trend across the selected period"
                heightClassName="h-72"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="custBilled" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={dashboardChartRevenueColor} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={dashboardChartRevenueColor} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="custPaid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={dashboardChartPaidColor} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={dashboardChartPaidColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={axisStyle} />
                    <YAxis tick={axisStyle} tickFormatter={(v) => fmtCurrency(v)} width={80} />
                    <Tooltip formatter={fmtCurrency} />
                    <Legend />
                    <Area type="monotone" dataKey="totalBilled" name="Billed" stroke={dashboardChartRevenueColor} fill="url(#custBilled)" strokeWidth={2} />
                    <Area type="monotone" dataKey="totalPaid" name="Paid" stroke={dashboardChartPaidColor} fill="url(#custPaid)" strokeWidth={2} />
                    <Area type="monotone" dataKey="totalDue" name="Due" stroke={dashboardChartDueColor} fill="none" strokeDasharray="5 5" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Invoice count trend"
                description="Invoices issued per reporting bucket"
                heightClassName="h-72"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={axisStyle} />
                    <YAxis tick={axisStyle} />
                    <Tooltip />
                    <Bar dataKey="invoiceCount" name="Invoices" fill={dashboardChartVolumeColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}

          {topCustomers.length > 0 && (
            <PrimaryBox>
              <div className="mb-4">
                <h2 className="text-base font-semibold text-foreground">Customer leaderboard</h2>
                <p className="text-sm text-muted-foreground">Ranked by total billed</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="pb-3 text-left font-medium">#</th>
                      <th className="pb-3 text-left font-medium">Customer</th>
                      <th className="pb-3 text-right font-medium">Invoices</th>
                      <th className="pb-3 text-right font-medium">Billed</th>
                      <th className="pb-3 text-right font-medium">Paid</th>
                      <th className="pb-3 text-right font-medium">Due</th>
                      <th className="pb-3 text-right font-medium">Avg invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCustomers.map((c, i) => (
                      <tr key={c.customerId} className="border-b border-border/50 last:border-0 hover:bg-accent/20 transition-colors">
                        <td className="py-3 pr-4 text-muted-foreground">{i + 1}</td>
                        <td className="py-3 pr-4 font-medium text-foreground">{c.customerName}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">{formatNumber(c.invoiceCount)}</td>
                        <td className="py-3 pr-4 text-right tabular-nums font-medium">{formatCurrency(c.totalBilled, currencyCode)}</td>
                        <td className="py-3 pr-4 text-right tabular-nums text-chart-2">{formatCurrency(c.totalPaid, currencyCode)}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          <span className={cn(c.totalDue > 0 ? "text-destructive" : "text-muted-foreground")}>
                            {formatCurrency(c.totalDue, currencyCode)}
                          </span>
                        </td>
                        <td className="py-3 text-right tabular-nums">{formatCurrency(c.averageInvoiceValue, currencyCode)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PrimaryBox>
          )}
        </>
      )}

      {data && (
        <div className="flex justify-end">
          <PeriodBadge startDate={data.startDate} endDate={data.endDate} />
        </div>
      )}
    </AnalyticsPageLayout>
  );
};

// ─── CATEGORY ANALYTICS PAGE ──────────────────────────────────────────────────
export const CategoryAnalyticsPageContent = () => {
  const { data, filter, isLoading, setFilter, refetch } = useCategoryAnalytics();
  const {
    data: { currentStore },
  } = useSelector(selectCurrentStoreState);
  const currencyCode = currentStore?.currencyCode;
  const fmtCurrency = makeCurrencyFormatter(currencyCode);

  const summary = data?.summary;
  const categories = data?.categories ?? [];
  const trends: CategoryTrendPoint[] = data?.trends ?? [];

  return (
    <AnalyticsPageLayout
      title="Category analytics"
      description="Revenue, profit, and units sold by product category."
      filter={filter}
      onFilterChange={(f) => setFilter({ ...filter, ...f } as CategoryAnalyticsFilter)}
      onRefresh={refetch}
      isLoading={isLoading}
    >
      <MetricGrid columns={3}>
        <MetricCard
          label="Total revenue"
          value={formatCurrency(summary?.totalRevenue ?? 0, currencyCode)}
          helper={`${summary?.totalCategoriesCount ?? 0} categories`}
          icon={BadgeIndianRupee}
          tone="primary"
        />
        <MetricCard
          label="Total profit"
          value={formatCurrency(summary?.totalProfit ?? 0, currencyCode)}
          helper={`${(summary?.averageProfitMargin ?? 0).toFixed(1)}% avg margin`}
          icon={TrendingUp}
          tone="success"
        />
        <MetricCard
          label="Units sold"
          value={formatNumber(summary?.totalQuantitySold ?? 0)}
          helper="Across all categories"
          icon={Boxes}
          tone="info"
        />
      </MetricGrid>

      {categories.length === 0 && trends.length === 0 ? (
        <AnalyticsEmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Donut chart */}
            {categories.length > 0 && (
              <ChartCard
                title="Revenue by category"
                description="Revenue share across product categories"
                heightClassName="h-72"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories.map((c) => ({ name: c.categoryName, value: c.revenue }))}
                      cx="50%"
                      cy="50%"
                      innerRadius="45%"
                      outerRadius="70%"
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categories.map((_, i) => (
                        <Cell key={i} fill={dashboardChartColors[i % dashboardChartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={fmtCurrency} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {/* Trend */}
            {trends.length > 0 && (
              <ChartCard
                title="Quantity sold trend"
                description="Units sold across the selected period"
                heightClassName="h-72"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="catQty" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={dashboardChartVolumeColor} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={dashboardChartVolumeColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={axisStyle} />
                    <YAxis tick={axisStyle} />
                    <Tooltip />
                    <Area type="monotone" dataKey="quantitySold" name="Units" stroke={dashboardChartVolumeColor} fill="url(#catQty)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </div>

          {categories.length > 0 && (
            <PrimaryBox>
              <div className="mb-4">
                <h2 className="text-base font-semibold text-foreground">Category performance</h2>
                <p className="text-sm text-muted-foreground">Ranked by revenue</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="pb-3 text-left font-medium">#</th>
                      <th className="pb-3 text-left font-medium">Category</th>
                      <th className="pb-3 text-right font-medium">Products</th>
                      <th className="pb-3 text-right font-medium">Units sold</th>
                      <th className="pb-3 text-right font-medium">Revenue</th>
                      <th className="pb-3 text-right font-medium">Profit</th>
                      <th className="pb-3 text-right font-medium">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c, i) => (
                      <tr key={c.categoryId} className="border-b border-border/50 last:border-0 hover:bg-accent/20 transition-colors">
                        <td className="py-3 pr-4">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ background: dashboardChartColors[i % dashboardChartColors.length] }}
                          />
                        </td>
                        <td className="py-3 pr-4 font-medium text-foreground">{c.categoryName}</td>
                        <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">{c.productCount}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">{formatNumber(c.quantitySold)}</td>
                        <td className="py-3 pr-4 text-right tabular-nums font-medium">{formatCurrency(c.revenue, currencyCode)}</td>
                        <td className="py-3 pr-4 text-right tabular-nums text-chart-2">{formatCurrency(c.profit, currencyCode)}</td>
                        <td className="py-3 text-right tabular-nums">
                          <span className={cn("rounded-md px-1.5 py-0.5 text-xs font-medium", c.profitMargin >= 20 ? "bg-chart-2/10 text-chart-2" : c.profitMargin >= 10 ? "bg-chart-4/10 text-chart-4" : "bg-destructive/10 text-destructive")}>
                            {c.profitMargin.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PrimaryBox>
          )}
        </>
      )}

      {data && (
        <div className="flex justify-end">
          <PeriodBadge startDate={data.startDate} endDate={data.endDate} />
        </div>
      )}
    </AnalyticsPageLayout>
  );
};
