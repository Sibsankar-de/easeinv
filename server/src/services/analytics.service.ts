import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import {
  AnalyticsPeriod,
  CategoryAnalyticsResponseDto,
  CategoryPerformanceDto,
  CategoryTrendPointDto,
  CustomerAnalyticsResponseDto,
  CustomerTrendPointDto,
  DashboardAnalyticsResponseDto,
  ProductAnalyticsResponseDto,
  ProductTrendPointDto,
  SalesAnalyticsResponseDto,
  SalesTrendPointDto,
  TopCustomerPerformanceDto,
  TopProductPerformanceDto,
  toCategoryAnalyticsDto,
  toCustomerAnalyticsDto,
  toDashboardAnalyticsDto,
  toProductAnalyticsDto,
  toSalesAnalyticsDto,
} from "../dto/analytics.dto";
import {
  AnalyticsQueryOptions,
  CategoryAnalyticsQueryOptions,
  CustomerAnalyticsQueryOptions,
  ProductAnalyticsQueryOptions,
} from "../types/analytics.types";

const allowedPeriods: AnalyticsPeriod[] = ["daily", "weekly", "monthly"];

const MONTH_NAMES = [
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

export const prepareAnalyticsContext = (
  options: AnalyticsQueryOptions = {},
): {
  period: AnalyticsPeriod;
  start: Date;
  end: Date;
  startDateStr: string;
  endDateStr: string;
} => {
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

  return {
    period,
    start,
    end,
    startDateStr: start.toISOString().slice(0, 10),
    endDateStr: end.toISOString().slice(0, 10),
  };
};

export const getPeriodBucketInfo = (
  dateInput: Date | string,
  period: AnalyticsPeriod,
): { key: string; label: string; date: string } => {
  const d = new Date(dateInput);

  if (period === "daily") {
    const key = d.toISOString().slice(0, 10);
    const label = `${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()]}`;
    return { key, label, date: key };
  }

  if (period === "weekly") {
    const tempDate = new Date(d.getTime());
    const dayNum = tempDate.getUTCDay() || 7;
    tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(
      ((tempDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    );
    const key = `${tempDate.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
    const label = `Week ${weekNo}, ${tempDate.getUTCFullYear()}`;

    const monday = new Date(d.getTime());
    monday.setUTCDate(d.getUTCDate() - (dayNum - 1));
    const date = monday.toISOString().slice(0, 10);

    return { key, label, date };
  }

  // Monthly bucket
  const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  const label = `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  const date = `${key}-01`;

  return { key, label, date };
};

export const getDashboardAnalytics = async (
  storeId: string,
  options: AnalyticsQueryOptions = {},
): Promise<DashboardAnalyticsResponseDto> => {
  const { period, start, end, startDateStr, endDateStr } =
    prepareAnalyticsContext(options);

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
    startDate: startDateStr,
    endDate: endDateStr,
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
  const { period, start, end, startDateStr, endDateStr } =
    prepareAnalyticsContext(options);

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
    const {
      key,
      label,
      date: bucketDate,
    } = getPeriodBucketInfo(stat.date, period);

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
    startDate: startDateStr,
    endDate: endDateStr,
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

export const getProductAnalytics = async (
  storeId: string,
  options: ProductAnalyticsQueryOptions = {},
): Promise<ProductAnalyticsResponseDto> => {
  const { period, start, end, startDateStr, endDateStr } =
    prepareAnalyticsContext(options);
  const limit = options.productCount ?? options.limit ?? 10;

  let targetProductIds: string[] | undefined = undefined;
  if (options.productId) {
    targetProductIds = [options.productId];
  } else if (options.categoryId) {
    const categoryProducts = await prisma.productCategory.findMany({
      where: { categoryId: options.categoryId },
      select: { productId: true },
    });
    targetProductIds = categoryProducts.map((cp) => cp.productId);
  }

  const productStats = await prisma.productDailyStat.findMany({
    where: {
      storeId,
      date: { gte: start, lte: end },
      ...(targetProductIds ? { productId: { in: targetProductIds } } : {}),
    },
    orderBy: { date: "asc" },
  });

  const productMap = new Map<
    string,
    {
      productId: string;
      productName: string;
      productSku: string;
      quantitySold: number;
      revenue: number;
      profit: number;
    }
  >();

  const trendBuckets = new Map<
    string,
    {
      periodKey: string;
      label: string;
      date: string;
      quantitySold: number;
      revenue: number;
      profit: number;
    }
  >();

  let rawTotalQuantitySold = 0;
  let rawTotalRevenue = 0;
  let rawTotalProfit = 0;

  for (const stat of productStats) {
    rawTotalQuantitySold += stat.quantitySold;
    rawTotalRevenue += stat.revenue;
    rawTotalProfit += stat.profit;

    // Aggregate per product
    const pExisting = productMap.get(stat.productId) || {
      productId: stat.productId,
      productName: stat.productName,
      productSku: stat.productSku,
      quantitySold: 0,
      revenue: 0,
      profit: 0,
    };
    pExisting.quantitySold += stat.quantitySold;
    pExisting.revenue += stat.revenue;
    pExisting.profit += stat.profit;
    if (stat.productName && !pExisting.productName) {
      pExisting.productName = stat.productName;
    }
    if (stat.productSku && !pExisting.productSku) {
      pExisting.productSku = stat.productSku;
    }
    productMap.set(stat.productId, pExisting);

    // Aggregate trend buckets
    const {
      key,
      label,
      date: bucketDate,
    } = getPeriodBucketInfo(stat.date, period);

    const tExisting = trendBuckets.get(key) || {
      periodKey: key,
      label,
      date: bucketDate,
      quantitySold: 0,
      revenue: 0,
      profit: 0,
    };
    tExisting.quantitySold += stat.quantitySold;
    tExisting.revenue += stat.revenue;
    tExisting.profit += stat.profit;

    trendBuckets.set(key, tExisting);
  }

  // Fallback for single product with 0 sales in target date range
  if (options.productId && productMap.size === 0) {
    const prod = await prisma.product.findUnique({
      where: { id: options.productId },
      select: { id: true, name: true, sku: true },
    });
    if (prod) {
      productMap.set(prod.id, {
        productId: prod.id,
        productName: prod.name,
        productSku: prod.sku || "",
        quantitySold: 0,
        revenue: 0,
        profit: 0,
      });
    }
  }

  const totalQuantitySold = roundTwoDecimals(rawTotalQuantitySold);
  const totalRevenue = roundTwoDecimals(rawTotalRevenue);
  const totalProfit = roundTwoDecimals(rawTotalProfit);
  const totalUniqueProductsSold = productMap.size;
  const averageProfitMargin =
    totalRevenue > 0 ? roundTwoDecimals((totalProfit / totalRevenue) * 100) : 0;

  const topProducts: TopProductPerformanceDto[] = Array.from(
    productMap.values(),
  )
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map((p) => {
      const rev = roundTwoDecimals(p.revenue);
      const prof = roundTwoDecimals(p.profit);
      return {
        productId: p.productId,
        productName: p.productName || "Unnamed Product",
        productSku: p.productSku || "",
        quantitySold: roundTwoDecimals(p.quantitySold),
        revenue: rev,
        profit: prof,
        profitMargin: rev > 0 ? roundTwoDecimals((prof / rev) * 100) : 0,
      };
    });

  const trends: ProductTrendPointDto[] = Array.from(trendBuckets.values()).map(
    (b) => ({
      periodKey: b.periodKey,
      label: b.label,
      date: b.date,
      quantitySold: roundTwoDecimals(b.quantitySold),
      revenue: roundTwoDecimals(b.revenue),
      profit: roundTwoDecimals(b.profit),
    }),
  );

  return toProductAnalyticsDto({
    storeId,
    period,
    startDate: startDateStr,
    endDate: endDateStr,
    productId: options.productId,
    categoryId: options.categoryId,
    productCount: limit,
    summary: {
      totalQuantitySold,
      totalRevenue,
      totalProfit,
      totalUniqueProductsSold,
      averageProfitMargin,
    },
    topProducts,
    trends,
  });
};

export const getCustomerAnalytics = async (
  storeId: string,
  options: CustomerAnalyticsQueryOptions = {},
): Promise<CustomerAnalyticsResponseDto> => {
  const { period, start, end, startDateStr, endDateStr } =
    prepareAnalyticsContext(options);
  const limit = options.customerCount ?? options.limit ?? 10;

  const customerStats = await prisma.customerDailyStat.findMany({
    where: {
      storeId,
      date: { gte: start, lte: end },
      ...(options.customerId ? { customerId: options.customerId } : {}),
    },
    orderBy: { date: "asc" },
  });

  const customerMap = new Map<
    string,
    {
      customerId: string;
      customerName: string;
      invoiceCount: number;
      totalBilled: number;
      totalPaid: number;
      totalDue: number;
    }
  >();

  const trendBuckets = new Map<
    string,
    {
      periodKey: string;
      label: string;
      date: string;
      totalBilled: number;
      totalPaid: number;
      totalDue: number;
      invoiceCount: number;
    }
  >();

  let rawTotalBilled = 0;
  let rawTotalPaid = 0;
  let rawTotalDue = 0;
  let rawTotalInvoices = 0;

  for (const stat of customerStats) {
    rawTotalBilled += stat.totalBilled;
    rawTotalPaid += stat.totalPaid;
    rawTotalDue += stat.totalDue;
    rawTotalInvoices += stat.invoiceCount;

    // Aggregate per customer
    const cExisting = customerMap.get(stat.customerId) || {
      customerId: stat.customerId,
      customerName: stat.customerName,
      invoiceCount: 0,
      totalBilled: 0,
      totalPaid: 0,
      totalDue: 0,
    };
    cExisting.invoiceCount += stat.invoiceCount;
    cExisting.totalBilled += stat.totalBilled;
    cExisting.totalPaid += stat.totalPaid;
    cExisting.totalDue += stat.totalDue;
    if (stat.customerName && !cExisting.customerName) {
      cExisting.customerName = stat.customerName;
    }
    customerMap.set(stat.customerId, cExisting);

    // Aggregate trend buckets
    const {
      key,
      label,
      date: bucketDate,
    } = getPeriodBucketInfo(stat.date, period);

    const tExisting = trendBuckets.get(key) || {
      periodKey: key,
      label,
      date: bucketDate,
      totalBilled: 0,
      totalPaid: 0,
      totalDue: 0,
      invoiceCount: 0,
    };
    tExisting.totalBilled += stat.totalBilled;
    tExisting.totalPaid += stat.totalPaid;
    tExisting.totalDue += stat.totalDue;
    tExisting.invoiceCount += stat.invoiceCount;

    trendBuckets.set(key, tExisting);
  }

  // Fallback for single customer with 0 invoices in target date range
  if (options.customerId && customerMap.size === 0) {
    const cust = await prisma.customer.findUnique({
      where: { id: options.customerId },
      select: { id: true, name: true },
    });
    if (cust) {
      customerMap.set(cust.id, {
        customerId: cust.id,
        customerName: cust.name,
        invoiceCount: 0,
        totalBilled: 0,
        totalPaid: 0,
        totalDue: 0,
      });
    }
  }

  const totalBilled = roundTwoDecimals(rawTotalBilled);
  const totalPaid = roundTwoDecimals(rawTotalPaid);
  const totalDue = roundTwoDecimals(rawTotalDue);
  const totalInvoices = rawTotalInvoices;
  const totalUniqueCustomers = customerMap.size;

  const averageBillPerCustomer =
    totalUniqueCustomers > 0
      ? roundTwoDecimals(totalBilled / totalUniqueCustomers)
      : 0;
  const paymentCollectionRate =
    totalBilled > 0 ? roundTwoDecimals((totalPaid / totalBilled) * 100) : 0;

  const topCustomers: TopCustomerPerformanceDto[] = Array.from(
    customerMap.values(),
  )
    .sort((a, b) => b.totalBilled - a.totalBilled)
    .slice(0, limit)
    .map((c) => {
      const billed = roundTwoDecimals(c.totalBilled);
      const paid = roundTwoDecimals(c.totalPaid);
      const due = roundTwoDecimals(c.totalDue);
      const count = c.invoiceCount;
      return {
        customerId: c.customerId,
        customerName: c.customerName || "Walk-in customer",
        invoiceCount: count,
        totalBilled: billed,
        totalPaid: paid,
        totalDue: due,
        averageInvoiceValue: count > 0 ? roundTwoDecimals(billed / count) : 0,
      };
    });

  const trends: CustomerTrendPointDto[] = Array.from(trendBuckets.values()).map(
    (b) => ({
      periodKey: b.periodKey,
      label: b.label,
      date: b.date,
      totalBilled: roundTwoDecimals(b.totalBilled),
      totalPaid: roundTwoDecimals(b.totalPaid),
      totalDue: roundTwoDecimals(b.totalDue),
      invoiceCount: b.invoiceCount,
    }),
  );

  return toCustomerAnalyticsDto({
    storeId,
    period,
    startDate: startDateStr,
    endDate: endDateStr,
    customerId: options.customerId,
    customerCount: limit,
    summary: {
      totalBilled,
      totalPaid,
      totalDue,
      totalInvoices,
      totalUniqueCustomers,
      averageBillPerCustomer,
      paymentCollectionRate,
    },
    topCustomers,
    trends,
  });
};

export const getCategoryAnalytics = async (
  storeId: string,
  options: CategoryAnalyticsQueryOptions = {},
): Promise<CategoryAnalyticsResponseDto> => {
  const { period, start, end, startDateStr, endDateStr } =
    prepareAnalyticsContext(options);
  const limit = options.categoryCount ?? options.limit ?? 10;

  // 1. Fetch store categories
  const categories = await prisma.category.findMany({
    where: {
      storeId,
      ...(options.categoryId ? { id: options.categoryId } : {}),
    },
    include: {
      products: { select: { productId: true } },
    },
  });

  const productToCategoryMap = new Map<
    string,
    { categoryId: string; categoryName: string }[]
  >();

  for (const cat of categories) {
    for (const p of cat.products) {
      const existing = productToCategoryMap.get(p.productId) || [];
      existing.push({ categoryId: cat.id, categoryName: cat.name });
      productToCategoryMap.set(p.productId, existing);
    }
  }

  const allCategoryProductIds = Array.from(productToCategoryMap.keys());

  // 2. Fetch ProductDailyStat records
  const productStats = await prisma.productDailyStat.findMany({
    where: {
      storeId,
      date: { gte: start, lte: end },
      ...(allCategoryProductIds.length > 0
        ? { productId: { in: allCategoryProductIds } }
        : {}),
    },
    orderBy: { date: "asc" },
  });

  const categoryPerformanceMap = new Map<
    string,
    {
      categoryId: string;
      categoryName: string;
      quantitySold: number;
      revenue: number;
      profit: number;
      productSet: Set<string>;
    }
  >();

  for (const cat of categories) {
    categoryPerformanceMap.set(cat.id, {
      categoryId: cat.id,
      categoryName: cat.name,
      quantitySold: 0,
      revenue: 0,
      profit: 0,
      productSet: new Set(cat.products.map((p) => p.productId)),
    });
  }

  const trendBuckets = new Map<
    string,
    {
      periodKey: string;
      label: string;
      date: string;
      quantitySold: number;
      revenue: number;
      profit: number;
    }
  >();

  let rawTotalQuantitySold = 0;
  let rawTotalRevenue = 0;
  let rawTotalProfit = 0;

  for (const stat of productStats) {
    const assignedCategories = productToCategoryMap.get(stat.productId) || [];

    for (const catInfo of assignedCategories) {
      const cPerf = categoryPerformanceMap.get(catInfo.categoryId);
      if (cPerf) {
        cPerf.quantitySold += stat.quantitySold;
        cPerf.revenue += stat.revenue;
        cPerf.profit += stat.profit;
      }
    }

    rawTotalQuantitySold += stat.quantitySold;
    rawTotalRevenue += stat.revenue;
    rawTotalProfit += stat.profit;

    // Aggregate trend buckets
    const {
      key,
      label,
      date: bucketDate,
    } = getPeriodBucketInfo(stat.date, period);

    const tExisting = trendBuckets.get(key) || {
      periodKey: key,
      label,
      date: bucketDate,
      quantitySold: 0,
      revenue: 0,
      profit: 0,
    };
    tExisting.quantitySold += stat.quantitySold;
    tExisting.revenue += stat.revenue;
    tExisting.profit += stat.profit;

    trendBuckets.set(key, tExisting);
  }

  const totalQuantitySold = roundTwoDecimals(rawTotalQuantitySold);
  const totalRevenue = roundTwoDecimals(rawTotalRevenue);
  const totalProfit = roundTwoDecimals(rawTotalProfit);
  const totalCategoriesCount = categories.length;
  const averageProfitMargin =
    totalRevenue > 0 ? roundTwoDecimals((totalProfit / totalRevenue) * 100) : 0;

  const categoryList: CategoryPerformanceDto[] = Array.from(
    categoryPerformanceMap.values(),
  )
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map((c) => {
      const rev = roundTwoDecimals(c.revenue);
      const prof = roundTwoDecimals(c.profit);
      return {
        categoryId: c.categoryId,
        categoryName: c.categoryName,
        quantitySold: roundTwoDecimals(c.quantitySold),
        revenue: rev,
        profit: prof,
        profitMargin: rev > 0 ? roundTwoDecimals((prof / rev) * 100) : 0,
        productCount: c.productSet.size,
      };
    });

  const trends: CategoryTrendPointDto[] = Array.from(trendBuckets.values()).map(
    (b) => ({
      periodKey: b.periodKey,
      label: b.label,
      date: b.date,
      quantitySold: roundTwoDecimals(b.quantitySold),
      revenue: roundTwoDecimals(b.revenue),
      profit: roundTwoDecimals(b.profit),
    }),
  );

  return toCategoryAnalyticsDto({
    storeId,
    period,
    startDate: startDateStr,
    endDate: endDateStr,
    categoryId: options.categoryId,
    categoryCount: limit,
    summary: {
      totalCategoriesCount,
      totalQuantitySold,
      totalRevenue,
      totalProfit,
      averageProfitMargin,
    },
    categories: categoryList,
    trends,
  });
};
