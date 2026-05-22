export type AnalyticsPeriod = "daily" | "weekly" | "monthly";

export type DashboardKpis = {
  totalRevenue: number;
  totalPaid: number;
  totalDue: number;
  totalInvoices: number;
  totalProductsSold: number;
  totalProfit: number;
  totalProducts: number;
  totalCustomers: number;
};

export type DashboardTrendPoint = {
  key: string;
  label: string;
  revenue: number;
  paid: number;
  due: number;
  invoices: number;
  productsSold: number;
  profit: number;
};

export type TopProductAnalytics = {
  productId: string;
  name: string;
  sku?: string;
  quantitySold: number;
  revenue: number;
  profit: number;
};

export type CategoryAnalytics = {
  categoryId: string;
  name: string;
  quantitySold: number;
  revenue: number;
};

export type RecentInvoiceAnalytics = {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  total: number;
  paidAmount: number;
  dueAmount: number;
  issueDate: string;
  status?: string;
};

export type BillingStatusAnalytics = {
  paid: number;
  partial: number;
  unpaid: number;
};

export type CustomerAnalytics = {
  customerId: string;
  name: string;
  phoneNumber?: string;
  invoiceCount: number;
  totalBilled: number;
  totalPaid: number;
  totalDue: number;
};

export type DashboardAnalytics = {
  period: AnalyticsPeriod;
  generatedAt: string;
  kpis: DashboardKpis;
  salesTrend: DashboardTrendPoint[];
  topProducts: TopProductAnalytics[];
  categorySales: CategoryAnalytics[];
  billingStatus: BillingStatusAnalytics;
  topCustomers: CustomerAnalytics[];
  recentInvoices: RecentInvoiceAnalytics[];
};
