// ─── Shared ───────────────────────────────────────────────────────────────────
export type AnalyticsPeriod = "daily" | "weekly" | "monthly";

export interface AnalyticsFilterState {
  mode: "period" | "custom";
  period: AnalyticsPeriod;
  startDate?: string; // YYYY-MM-DD, only when mode === "custom"
  endDate?: string; // YYYY-MM-DD, only when mode === "custom"
}

export const DEFAULT_ANALYTICS_FILTER: AnalyticsFilterState = {
  mode: "period",
  period: "daily",
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardAnalyticsKpis {
  totalRevenue: number;
  paidAmount: number;
  dueAmount: number;
  productsSold: number;
  totalProfit: number;
  totalInvoices: number;
  averageInvoiceValue: number;
  profitMargin: number;
}

export interface DashboardAnalyticsResponse {
  storeId: string;
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;
  generatedAt: string;
  kpis: DashboardAnalyticsKpis;
}

// ─── Sales ────────────────────────────────────────────────────────────────────
export interface SalesTrendPoint {
  periodKey: string;
  label: string;
  date: string;
  revenue: number;
  paid: number;
  due: number;
  profit: number;
  invoiceCount: number;
  averageRevenuePerInvoice: number;
}

export interface SalesAnalyticsSummary {
  totalRevenue: number;
  totalProfit: number;
  totalPaid: number;
  totalDue: number;
  totalInvoices: number;
  averageRevenuePerInvoice: number;
  paymentCollectionRate: number;
}

export interface SalesAnalyticsResponse {
  storeId: string;
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;
  generatedAt: string;
  summary: SalesAnalyticsSummary;
  trends: SalesTrendPoint[];
}

// ─── Products ─────────────────────────────────────────────────────────────────
export interface TopProductPerformance {
  productId: string;
  productName: string;
  productSku: string;
  quantitySold: number;
  revenue: number;
  profit: number;
  profitMargin: number;
}

export interface ProductAnalyticsSummary {
  totalQuantitySold: number;
  totalRevenue: number;
  totalProfit: number;
  totalUniqueProductsSold: number;
  averageProfitMargin: number;
}

export interface ProductTrendPoint {
  periodKey: string;
  label: string;
  date: string;
  quantitySold: number;
  revenue: number;
  profit: number;
}

export interface ProductAnalyticsResponse {
  storeId: string;
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;
  productId?: string;
  categoryId?: string;
  productCount: number;
  generatedAt: string;
  summary: ProductAnalyticsSummary;
  topProducts: TopProductPerformance[];
  trends: ProductTrendPoint[];
}

export interface ProductAnalyticsFilter extends AnalyticsFilterState {
  productId?: string;
  categoryId?: string;
  productCount?: number;
}

// ─── Customers ────────────────────────────────────────────────────────────────
export interface TopCustomerPerformance {
  customerId: string;
  customerName: string;
  invoiceCount: number;
  totalBilled: number;
  totalPaid: number;
  totalDue: number;
  averageInvoiceValue: number;
}

export interface CustomerAnalyticsSummary {
  totalBilled: number;
  totalPaid: number;
  totalDue: number;
  totalInvoices: number;
  totalUniqueCustomers: number;
  averageBillPerCustomer: number;
  paymentCollectionRate: number;
}

export interface CustomerTrendPoint {
  periodKey: string;
  label: string;
  date: string;
  totalBilled: number;
  totalPaid: number;
  totalDue: number;
  invoiceCount: number;
}

export interface CustomerAnalyticsResponse {
  storeId: string;
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;
  customerId?: string;
  customerCount: number;
  generatedAt: string;
  summary: CustomerAnalyticsSummary;
  topCustomers: TopCustomerPerformance[];
  trends: CustomerTrendPoint[];
}

export interface CustomerAnalyticsFilter extends AnalyticsFilterState {
  customerId?: string;
  customerCount?: number;
}

// ─── Categories ───────────────────────────────────────────────────────────────
export interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  quantitySold: number;
  revenue: number;
  profit: number;
  profitMargin: number;
  productCount: number;
}

export interface CategoryAnalyticsSummary {
  totalCategoriesCount: number;
  totalQuantitySold: number;
  totalRevenue: number;
  totalProfit: number;
  averageProfitMargin: number;
}

export interface CategoryTrendPoint {
  periodKey: string;
  label: string;
  date: string;
  quantitySold: number;
  revenue: number;
  profit: number;
}

export interface CategoryAnalyticsResponse {
  storeId: string;
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;
  categoryId?: string;
  categoryCount: number;
  generatedAt: string;
  summary: CategoryAnalyticsSummary;
  categories: CategoryPerformance[];
  trends: CategoryTrendPoint[];
}

export interface CategoryAnalyticsFilter extends AnalyticsFilterState {
  categoryId?: string;
  categoryCount?: number;
}
