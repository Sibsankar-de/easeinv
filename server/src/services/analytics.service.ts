import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import {
  AnalyticsPeriod,
  DashboardAnalytics,
  DashboardTrendPoint,
} from "../types/DashboardAnalyticsType";

const allowedPeriods: AnalyticsPeriod[] = ["daily", "weekly", "monthly"];

const periodWindows: Record<AnalyticsPeriod, number> = {
  daily: 30,
  weekly: 12,
  monthly: 12,
};

const getPeriodStartDate = (period: AnalyticsPeriod): Date => {
  const start = new Date();
  if (period === "daily") {
    start.setDate(start.getDate() - (periodWindows.daily - 1));
  } else if (period === "weekly") {
    start.setDate(start.getDate() - periodWindows.weekly * 7);
  } else {
    start.setMonth(start.getMonth() - (periodWindows.monthly - 1));
  }
  start.setHours(0, 0, 0, 0);
  return start;
};

const toNumber = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

type TrendRow = {
  key: string;
  label: string;
  revenue: string | number;
  paid: string | number;
  due: string | number;
  invoices: string | number;
  profit: string | number;
};

type ProductRow = {
  productid: string | null;
  name: string | null;
  sku: string | null;
  quantitysold: string | number;
  revenue: string | number;
  profit: string | number;
};

type CategoryRow = {
  categoryid: string | null;
  name: string | null;
  quantitysold: string | number;
  revenue: string | number;
};

type CustomerRow = {
  customerid: string | null;
  name: string | null;
  phonenumber: string | null;
  invoicecount: string | number;
  totalbilled: string | number;
  totalpaid: string | number;
  totaldue: string | number;
};

export const getDashboardAnalytics = async (
  storeId: string,
  requestedPeriod: string,
): Promise<DashboardAnalytics> => {
  if (!allowedPeriods.includes(requestedPeriod as AnalyticsPeriod)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Period must be daily, weekly, or monthly.",
    );
  }

  const period = requestedPeriod as AnalyticsPeriod;
  const startDate = getPeriodStartDate(period);

  // Build date format strings for PostgreSQL
  const keyFormat =
    period === "daily"
      ? "YYYY-MM-DD"
      : period === "weekly"
        ? "IYYY-IW"
        : "YYYY-MM";
  const labelFormat =
    period === "daily"
      ? "DD Mon"
      : period === "weekly"
        ? '"W"IW IYYY'
        : "Mon YYYY";

  const [
    kpiAgg,
    trendRows,
    productRows,
    categoryRows,
    billingStatusAgg,
    customerRows,
    recentInvoices,
    totalProducts,
    totalCustomers,
  ] = await Promise.all([
    // KPIs
    prisma.invoice.aggregate({
      where: { storeId },
      _sum: {
        total: true,
        paidAmount: true,
        dueAmount: true,
        totalProfit: true,
      },
      _count: { id: true },
    }),

    // Sales trend via raw SQL
    prisma.$queryRaw<TrendRow[]>`
      SELECT
        TO_CHAR("issueDate" AT TIME ZONE 'UTC', ${keyFormat}) AS key,
        TO_CHAR("issueDate" AT TIME ZONE 'UTC', ${labelFormat}) AS label,
        COALESCE(SUM(total), 0) AS revenue,
        COALESCE(SUM("paidAmount"), 0) AS paid,
        COALESCE(SUM("dueAmount"), 0) AS due,
        COUNT(*)::int AS invoices,
        COALESCE(SUM("totalProfit"), 0) AS profit
      FROM invoices
      WHERE "storeId" = ${storeId}::uuid
        AND "issueDate" >= ${startDate}
      GROUP BY 1, 2
      ORDER BY 1 ASC
    `,

    // Top products via raw SQL (joins with invoice_items)
    prisma.$queryRaw<ProductRow[]>`
      SELECT
        ii."productId" AS productid,
        ii."productName" AS name,
        ii."productSku" AS sku,
        COALESCE(SUM(ii."netQuantity"), 0) AS quantitysold,
        COALESCE(SUM(ii."totalPrice"), 0) AS revenue,
        COALESCE(SUM(ii."totalProfit"), 0) AS profit
      FROM invoice_items ii
      INNER JOIN invoices inv ON inv.id = ii."invoiceId"
      WHERE inv."storeId" = ${storeId}::uuid
      GROUP BY ii."productId", ii."productName", ii."productSku"
      ORDER BY revenue DESC
      LIMIT 8
    `,

    // Category sales via raw SQL
    prisma.$queryRaw<CategoryRow[]>`
      SELECT
        COALESCE(c.id::text, 'uncategorized') AS categoryid,
        COALESCE(c.name, 'Uncategorized') AS name,
        COALESCE(SUM(ii."netQuantity"), 0) AS quantitysold,
        COALESCE(SUM(ii."totalPrice"), 0) AS revenue
      FROM invoice_items ii
      INNER JOIN invoices inv ON inv.id = ii."invoiceId"
      LEFT JOIN product_categories pc ON pc."productId" = ii."productId"
      LEFT JOIN categories c ON c.id = pc."categoryId"
      WHERE inv."storeId" = ${storeId}::uuid
      GROUP BY c.id, c.name
      ORDER BY revenue DESC
      LIMIT 6
    `,

    // Billing status breakdown
    prisma.$queryRaw<{ paid: number; partial: number; unpaid: number }[]>`
      SELECT
        COALESCE(SUM(CASE WHEN "dueAmount" <= 0 THEN 1 ELSE 0 END), 0)::int AS paid,
        COALESCE(SUM(CASE WHEN "dueAmount" > 0 AND "paidAmount" > 0 THEN 1 ELSE 0 END), 0)::int AS partial,
        COALESCE(SUM(CASE WHEN "dueAmount" > 0 AND "paidAmount" <= 0 THEN 1 ELSE 0 END), 0)::int AS unpaid
      FROM invoices
      WHERE "storeId" = ${storeId}::uuid
    `,

    // Top customers via raw SQL
    prisma.$queryRaw<CustomerRow[]>`
      SELECT
        COALESCE(c.id::text, 'walk-in') AS customerid,
        COALESCE(c.name, 'Walk-in customer') AS name,
        c."phoneNumber" AS phonenumber,
        COUNT(inv.id)::int AS invoicecount,
        COALESCE(SUM(inv.total), 0) AS totalbilled,
        COALESCE(SUM(inv."paidAmount"), 0) AS totalpaid,
        COALESCE(SUM(inv."dueAmount"), 0) AS totaldue
      FROM invoices inv
      LEFT JOIN customers c ON c.id = inv."customerId"
      WHERE inv."storeId" = ${storeId}::uuid
      GROUP BY c.id, c.name, c."phoneNumber"
      ORDER BY totalbilled DESC
      LIMIT 8
    `,

    // Recent invoices
    prisma.invoice.findMany({
      where: { storeId },
      orderBy: [{ issueDate: "desc" }, { createdAt: "desc" }],
      take: 6,
      include: {
        customer: { select: { id: true, name: true } },
      },
    }),

    // Counts
    prisma.product.count({ where: { storeId } }),
    prisma.customer.count({ where: { storeId } }),
  ]);

  const kpis = kpiAgg;
  const billingStatus = billingStatusAgg[0] ?? {
    paid: 0,
    partial: 0,
    unpaid: 0,
  };

  // Compute totalProductsSold from invoice_items separately
  const productsSoldAgg = await prisma.$queryRaw<{ total: string | number }[]>`
    SELECT COALESCE(SUM(ii."netQuantity"), 0) AS total
    FROM invoice_items ii
    INNER JOIN invoices inv ON inv.id = ii."invoiceId"
    WHERE inv."storeId" = ${storeId}::uuid
  `;
  const totalProductsSold = toNumber(Number(productsSoldAgg[0]?.total ?? 0));

  const payload: DashboardAnalytics = {
    period,
    generatedAt: new Date().toISOString(),
    kpis: {
      totalRevenue: toNumber(kpis._sum.total),
      totalPaid: toNumber(kpis._sum.paidAmount),
      totalDue: toNumber(kpis._sum.dueAmount),
      totalInvoices: toNumber(kpis._count.id),
      totalProductsSold,
      totalProfit: toNumber(kpis._sum.totalProfit),
      totalProducts,
      totalCustomers,
    },
    salesTrend: trendRows.map(
      (point): DashboardTrendPoint => ({
        key: point.key,
        label: point.label,
        revenue: toNumber(Number(point.revenue)),
        paid: toNumber(Number(point.paid)),
        due: toNumber(Number(point.due)),
        invoices: toNumber(Number(point.invoices)),
        productsSold: 0,
        profit: toNumber(Number(point.profit)),
      }),
    ),
    topProducts: productRows.map((p) => ({
      productId: p.productid ?? "unknown",
      name: p.name ?? "Unknown product",
      sku: p.sku ?? "",
      quantitySold: toNumber(Number(p.quantitysold)),
      revenue: toNumber(Number(p.revenue)),
      profit: toNumber(Number(p.profit)),
    })),
    categorySales: categoryRows.map((c) => ({
      categoryId: c.categoryid ?? "uncategorized",
      name: c.name ?? "Uncategorized",
      quantitySold: toNumber(Number(c.quantitysold)),
      revenue: toNumber(Number(c.revenue)),
    })),
    billingStatus: {
      paid: toNumber(billingStatus.paid),
      partial: toNumber(billingStatus.partial),
      unpaid: toNumber(billingStatus.unpaid),
    },
    topCustomers: customerRows.map((c) => ({
      customerId: c.customerid ?? "walk-in",
      name: c.name ?? "Walk-in customer",
      phoneNumber: c.phonenumber ?? undefined,
      invoiceCount: toNumber(Number(c.invoicecount)),
      totalBilled: toNumber(Number(c.totalbilled)),
      totalPaid: toNumber(Number(c.totalpaid)),
      totalDue: toNumber(Number(c.totaldue)),
    })),
    recentInvoices: recentInvoices.map((invoice) => ({
      _id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customer?.name ?? "Walk-in customer",
      total: toNumber(invoice.total),
      paidAmount: toNumber(invoice.paidAmount),
      dueAmount: toNumber(invoice.dueAmount),
      issueDate:
        invoice.issueDate?.toISOString?.() ?? String(invoice.issueDate),
      status: invoice.status,
    })),
  };

  return payload;
};
