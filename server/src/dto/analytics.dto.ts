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
