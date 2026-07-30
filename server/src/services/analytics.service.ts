import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import {
  AnalyticsPeriod,
  DashboardAnalyticsResponseDto,
  SalesAnalyticsResponseDto,
  SalesTrendPointDto,
  toDashboardAnalyticsDto,
  toSalesAnalyticsDto,
} from "../dto/analytics.dto";
import { AnalyticsQueryOptions } from "../types/analytics.types";

const allowedPeriods: AnalyticsPeriod[] = ["daily", "weekly", "monthly"];

const roundTwoDecimals = (val: number): number =>
  Math.round((val + Number.EPSILON) * 100) / 100;

export const resolveDateRange = (
  period: AnalyticsPeriod = "daily",
  startDateStr?: string,
  endDateStr?: string,
): { start: Date; end: Date } => {
  let end: Date;
  let start: Date;

  if (endDateStr) {
    end = new Date(endDateStr);
    if (isNaN(end.getTime())) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid endDate format.");
    }
    end.setHours(23, 59, 59, 999);
  } else {
    end = new Date();
    end.setHours(23, 59, 59, 999);
  }

  if (startDateStr) {
    start = new Date(startDateStr);
    if (isNaN(start.getTime())) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid startDate format.");
    }
    start.setHours(0, 0, 0, 0);
  } else {
    start = new Date(end);
    start.setHours(0, 0, 0, 0);
    if (period === "daily") {
      start.setDate(start.getDate() - 29); // 30 days inclusive
    } else if (period === "weekly") {
      start.setDate(start.getDate() - 7 * 11); // 12 weeks
    } else if (period === "monthly") {
      start.setMonth(start.getMonth() - 11); // 12 months
      start.setDate(1);
    }
  }

  if (start > end) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "startDate cannot be after endDate.",
    );
  }

  return { start, end };
};

export const getDashboardAnalytics = async (
  storeId: string,
  options: AnalyticsQueryOptions = {},
): Promise<DashboardAnalyticsResponseDto> => {
  const period: AnalyticsPeriod = options.period ?? "daily";
  if (!allowedPeriods.includes(period)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Period must be daily, weekly, or monthly.",
    );
  }

  const { start, end } = resolveDateRange(
    period,
    options.startDate,
    options.endDate,
  );

  const [invoiceAgg, productAgg] = await Promise.all([
    prisma.invoiceDailyStat.aggregate({
      where: {
        storeId,
        date: { gte: start, lte: end },
      },
      _sum: {
        revenue: true,
        paid: true,
        due: true,
        profit: true,
        invoiceCount: true,
      },
    }),
    prisma.productDailyStat.aggregate({
      where: {
        storeId,
        date: { gte: start, lte: end },
      },
      _sum: {
        quantitySold: true,
      },
    }),
  ]);

  const totalRevenue = roundTwoDecimals(invoiceAgg._sum.revenue ?? 0);
  const paidAmount = roundTwoDecimals(invoiceAgg._sum.paid ?? 0);
  const dueAmount = roundTwoDecimals(invoiceAgg._sum.due ?? 0);
  const totalProfit = roundTwoDecimals(invoiceAgg._sum.profit ?? 0);
  const totalInvoices = invoiceAgg._sum.invoiceCount ?? 0;
  const productsSold = roundTwoDecimals(productAgg._sum.quantitySold ?? 0);

  const averageInvoiceValue =
    totalInvoices > 0 ? roundTwoDecimals(totalRevenue / totalInvoices) : 0;
  const profitMargin =
    totalRevenue > 0 ? roundTwoDecimals((totalProfit / totalRevenue) * 100) : 0;

  return toDashboardAnalyticsDto({
    storeId,
    period,
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    kpis: {
      totalRevenue,
      paidAmount,
      dueAmount,
      productsSold,
      totalProfit,
      totalInvoices,
      averageInvoiceValue,
      profitMargin,
    },
  });
};

export const getSalesAnalytics = async (
  storeId: string,
  options: AnalyticsQueryOptions = {},
): Promise<SalesAnalyticsResponseDto> => {
  const period: AnalyticsPeriod = options.period ?? "daily";
  if (!allowedPeriods.includes(period)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Period must be daily, weekly, or monthly.",
    );
  }

  const { start, end } = resolveDateRange(
    period,
    options.startDate,
    options.endDate,
  );

  const dailyStats = await prisma.invoiceDailyStat.findMany({
    where: {
      storeId,
      date: { gte: start, lte: end },
    },
    orderBy: { date: "asc" },
  });

  const buckets = new Map<
    string,
    {
      periodKey: string;
      label: string;
      date: string;
      revenue: number;
      paid: number;
      due: number;
      profit: number;
      invoiceCount: number;
    }
  >();

  for (const stat of dailyStats) {
    const d = new Date(stat.date);
    let key: string;
    let label: string;
    let bucketDate: string;

    if (period === "daily") {
      key = d.toISOString().slice(0, 10);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      label = `${d.getUTCDate()} ${months[d.getUTCMonth()]}`;
      bucketDate = key;
    } else if (period === "weekly") {
      const tempDate = new Date(d.getTime());
      const dayNum = tempDate.getUTCDay() || 7;
      tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil(
        ((tempDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
      );
      key = `${tempDate.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
      label = `Week ${weekNo}, ${tempDate.getUTCFullYear()}`;

      const monday = new Date(d.getTime());
      monday.setUTCDate(d.getUTCDate() - (dayNum - 1));
      bucketDate = monday.toISOString().slice(0, 10);
    } else {
      key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      label = `${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
      bucketDate = `${key}-01`;
    }

    const existing = buckets.get(key) || {
      periodKey: key,
      label,
      date: bucketDate,
      revenue: 0,
      paid: 0,
      due: 0,
      profit: 0,
      invoiceCount: 0,
    };

    existing.revenue += stat.revenue;
    existing.paid += stat.paid;
    existing.due += stat.due;
    existing.profit += stat.profit;
    existing.invoiceCount += stat.invoiceCount;

    buckets.set(key, existing);
  }

  const trends: SalesTrendPointDto[] = Array.from(buckets.values()).map((b) => {
    const rev = roundTwoDecimals(b.revenue);
    const pd = roundTwoDecimals(b.paid);
    const du = roundTwoDecimals(b.due);
    const pr = roundTwoDecimals(b.profit);
    const count = b.invoiceCount;
    return {
      periodKey: b.periodKey,
      label: b.label,
      date: b.date,
      revenue: rev,
      paid: pd,
      due: du,
      profit: pr,
      invoiceCount: count,
      averageRevenuePerInvoice: count > 0 ? roundTwoDecimals(rev / count) : 0,
    };
  });

  const totalRevenue = roundTwoDecimals(
    trends.reduce((sum, t) => sum + t.revenue, 0),
  );
  const totalProfit = roundTwoDecimals(
    trends.reduce((sum, t) => sum + t.profit, 0),
  );
  const totalPaid = roundTwoDecimals(
    trends.reduce((sum, t) => sum + t.paid, 0),
  );
  const totalDue = roundTwoDecimals(trends.reduce((sum, t) => sum + t.due, 0));
  const totalInvoices = trends.reduce((sum, t) => sum + t.invoiceCount, 0);

  const averageRevenuePerInvoice =
    totalInvoices > 0 ? roundTwoDecimals(totalRevenue / totalInvoices) : 0;
  const paymentCollectionRate =
    totalRevenue > 0 ? roundTwoDecimals((totalPaid / totalRevenue) * 100) : 0;

  return toSalesAnalyticsDto({
    storeId,
    period,
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    summary: {
      totalRevenue,
      totalProfit,
      totalPaid,
      totalDue,
      totalInvoices,
      averageRevenuePerInvoice,
      paymentCollectionRate,
    },
    trends,
  });
};
