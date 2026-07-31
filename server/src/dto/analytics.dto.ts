export type AnalyticsPeriod = "daily" | "weekly" | "monthly";

export interface DashboardAnalyticsKpisDto {
  totalRevenue: number;
  paidAmount: number;
  dueAmount: number;
  productsSold: number;
  totalProfit: number;
  totalInvoices: number;
  averageInvoiceValue: number;
  profitMargin: number;
}

export interface DashboardAnalyticsResponseDto {
  storeId: string;
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;
  generatedAt: string;
  kpis: DashboardAnalyticsKpisDto;
}

export interface SalesTrendPointDto {
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

export interface SalesAnalyticsSummaryDto {
  totalRevenue: number;
  totalProfit: number;
  totalPaid: number;
  totalDue: number;
  totalInvoices: number;
  averageRevenuePerInvoice: number;
  paymentCollectionRate: number;
}

export interface SalesAnalyticsResponseDto {
  storeId: string;
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;
  generatedAt: string;
  summary: SalesAnalyticsSummaryDto;
  trends: SalesTrendPointDto[];
}

export interface ProductAnalyticsSummaryDto {
  totalQuantitySold: number;
  totalRevenue: number;
  totalProfit: number;
  totalUniqueProductsSold: number;
  averageProfitMargin: number;
}

export interface TopProductPerformanceDto {
  productId: string;
  productName: string;
  productSku: string;
  quantitySold: number;
  revenue: number;
  profit: number;
  profitMargin: number;
}

export interface ProductTrendPointDto {
  periodKey: string;
  label: string;
  date: string;
  quantitySold: number;
  revenue: number;
  profit: number;
}

export interface ProductAnalyticsResponseDto {
  storeId: string;
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;
  productId?: string;
  categoryId?: string;
  productCount: number;
  generatedAt: string;
  summary: ProductAnalyticsSummaryDto;
  topProducts: TopProductPerformanceDto[];
  trends: ProductTrendPointDto[];
}

export interface CustomerAnalyticsSummaryDto {
  totalBilled: number;
  totalPaid: number;
  totalDue: number;
  totalInvoices: number;
  totalUniqueCustomers: number;
  averageBillPerCustomer: number;
  paymentCollectionRate: number;
}

export interface TopCustomerPerformanceDto {
  customerId: string;
  customerName: string;
  invoiceCount: number;
  totalBilled: number;
  totalPaid: number;
  totalDue: number;
  averageInvoiceValue: number;
}

export interface CustomerTrendPointDto {
  periodKey: string;
  label: string;
  date: string;
  totalBilled: number;
  totalPaid: number;
  totalDue: number;
  invoiceCount: number;
}

export interface CustomerAnalyticsResponseDto {
  storeId: string;
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;
  customerId?: string;
  customerCount: number;
  generatedAt: string;
  summary: CustomerAnalyticsSummaryDto;
  topCustomers: TopCustomerPerformanceDto[];
  trends: CustomerTrendPointDto[];
}

export interface CategoryPerformanceDto {
  categoryId: string;
  categoryName: string;
  quantitySold: number;
  revenue: number;
  profit: number;
  profitMargin: number;
  productCount: number;
}

export interface CategoryAnalyticsSummaryDto {
  totalCategoriesCount: number;
  totalQuantitySold: number;
  totalRevenue: number;
  totalProfit: number;
  averageProfitMargin: number;
}

export interface CategoryTrendPointDto {
  periodKey: string;
  label: string;
  date: string;
  quantitySold: number;
  revenue: number;
  profit: number;
}

export interface CategoryAnalyticsResponseDto {
  storeId: string;
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;
  categoryId?: string;
  categoryCount: number;
  generatedAt: string;
  summary: CategoryAnalyticsSummaryDto;
  categories: CategoryPerformanceDto[];
  topProducts?: TopProductPerformanceDto[];
  trends: CategoryTrendPointDto[];
}

export const toDashboardAnalyticsDto = (params: {
  storeId: string;
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;
  kpis: DashboardAnalyticsKpisDto;
}): DashboardAnalyticsResponseDto => ({
  storeId: params.storeId,
  period: params.period,
  startDate: params.startDate,
  endDate: params.endDate,
  generatedAt: new Date().toISOString(),
  kpis: params.kpis,
});

export const toSalesAnalyticsDto = (params: {
  storeId: string;
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;
  summary: SalesAnalyticsSummaryDto;
  trends: SalesTrendPointDto[];
}): SalesAnalyticsResponseDto => ({
  storeId: params.storeId,
  period: params.period,
  startDate: params.startDate,
  endDate: params.endDate,
  generatedAt: new Date().toISOString(),
  summary: params.summary,
  trends: params.trends,
});

export const toProductAnalyticsDto = (params: {
  storeId: string;
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;
  productId?: string;
  categoryId?: string;
  productCount: number;
  summary: ProductAnalyticsSummaryDto;
  topProducts: TopProductPerformanceDto[];
  trends: ProductTrendPointDto[];
}): ProductAnalyticsResponseDto => ({
  storeId: params.storeId,
  period: params.period,
  startDate: params.startDate,
  endDate: params.endDate,
  productId: params.productId,
  categoryId: params.categoryId,
  productCount: params.productCount,
  generatedAt: new Date().toISOString(),
  summary: params.summary,
  topProducts: params.topProducts,
  trends: params.trends,
});

export const toCustomerAnalyticsDto = (params: {
  storeId: string;
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;
  customerId?: string;
  customerCount: number;
  summary: CustomerAnalyticsSummaryDto;
  topCustomers: TopCustomerPerformanceDto[];
  trends: CustomerTrendPointDto[];
}): CustomerAnalyticsResponseDto => ({
  storeId: params.storeId,
  period: params.period,
  startDate: params.startDate,
  endDate: params.endDate,
  customerId: params.customerId,
  customerCount: params.customerCount,
  generatedAt: new Date().toISOString(),
  summary: params.summary,
  topCustomers: params.topCustomers,
  trends: params.trends,
});

export const toCategoryAnalyticsDto = (params: {
  storeId: string;
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;
  categoryId?: string;
  categoryCount: number;
  summary: CategoryAnalyticsSummaryDto;
  categories: CategoryPerformanceDto[];
  topProducts?: TopProductPerformanceDto[];
  trends: CategoryTrendPointDto[];
}): CategoryAnalyticsResponseDto => ({
  storeId: params.storeId,
  period: params.period,
  startDate: params.startDate,
  endDate: params.endDate,
  categoryId: params.categoryId,
  categoryCount: params.categoryCount,
  generatedAt: new Date().toISOString(),
  summary: params.summary,
  categories: params.categories,
  topProducts: params.topProducts,
  trends: params.trends,
});
