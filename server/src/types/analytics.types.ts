export * from "../dto/analytics.dto";

export interface AnalyticsQueryOptions {
  period?: import("../dto/analytics.dto").AnalyticsPeriod;
  startDate?: string;
  endDate?: string;
}

export interface ProductAnalyticsQueryOptions extends AnalyticsQueryOptions {
  productId?: string;
  categoryId?: string;
  productCount?: number;
  limit?: number;
}

export interface CustomerAnalyticsQueryOptions extends AnalyticsQueryOptions {
  customerId?: string;
  customerCount?: number;
  limit?: number;
}

export interface CategoryAnalyticsQueryOptions extends AnalyticsQueryOptions {
  categoryId?: string;
  categoryCount?: number;
  limit?: number;
}
