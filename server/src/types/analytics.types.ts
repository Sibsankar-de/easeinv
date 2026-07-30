export * from "../dto/analytics.dto";

export interface AnalyticsQueryOptions {
  period?: import("../dto/analytics.dto").AnalyticsPeriod;
  startDate?: string;
  endDate?: string;
}
