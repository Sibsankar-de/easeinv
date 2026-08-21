import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { InvoiceStatus } from "@prisma/client";
import { createModuleLogger } from "../utils/logger";

const log = createModuleLogger(import.meta.url);

type InvoiceAggRow = {
  storeId: string;
  revenue: number;
  paid: number;
  due: number;
  profit: number;
  invoiceCount: bigint;
};

type ProductAggRow = {
  storeId: string;
  productId: string;
  productName: string;
  productSku: string;
  quantitySold: number;
  revenue: number;
  profit: number;
};

type CustomerAggRow = {
  storeId: string;
  customerId: string;
  customerName: string;
  invoiceCount: bigint;
  totalBilled: number;
  totalPaid: number;
  totalDue: number;
};

const upsertInvoiceDailyStats = (
  rows: InvoiceAggRow[],
  today: Date,
): Promise<unknown> =>
  Promise.all(
    rows.map((row) => {
      const stats = {
        revenue: row.revenue,
        paid: row.paid,
        due: row.due,
        profit: row.profit,
        invoiceCount: Number(row.invoiceCount),
      };

      return prisma.invoiceDailyStat.upsert({
        where: { storeId_date: { storeId: row.storeId, date: today } },
        create: { storeId: row.storeId, date: today, ...stats },
        update: { ...stats },
      });
    }),
  );

const upsertProductDailyStats = (
  rows: ProductAggRow[],
  today: Date,
): Promise<unknown> =>
  Promise.all(
    rows.map((row) => {
      const stats = {
        productName: row.productName,
        productSku: row.productSku,
        quantitySold: row.quantitySold,
        revenue: row.revenue,
        profit: row.profit,
      };

      return prisma.productDailyStat.upsert({
        where: {
          storeId_date_productId: {
            storeId: row.storeId,
            date: today,
            productId: row.productId,
          },
        },
        create: {
          storeId: row.storeId,
          date: today,
          productId: row.productId,
          ...stats,
        },
        update: { ...stats },
      });
    }),
  );

const upsertCustomerDailyStats = (
  rows: CustomerAggRow[],
  today: Date,
): Promise<unknown> =>
  Promise.all(
    rows.map((row) => {
      const stats = {
        customerName: row.customerName,
        invoiceCount: Number(row.invoiceCount),
        totalBilled: row.totalBilled,
        totalPaid: row.totalPaid,
        totalDue: row.totalDue,
      };

      return prisma.customerDailyStat.upsert({
        where: {
          storeId_date_customerId: {
            storeId: row.storeId,
            date: today,
            customerId: row.customerId,
          },
        },
        create: {
          storeId: row.storeId,
          date: today,
          customerId: row.customerId,
          ...stats,
        },
        update: { ...stats },
      });
    }),
  );

export const computeDailyStats = async (): Promise<void> => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  log.info(
    `[dailyStats] Computing stats for ${today.toISOString().slice(0, 10)}`,
  );

  const [invoiceRows, productRows, customerRows] = await Promise.all([
    prisma.$queryRaw<InvoiceAggRow[]>`
      SELECT
        "storeId",
        COALESCE(SUM(total), 0)::float          AS revenue,
        COALESCE(SUM("paidAmount"), 0)::float   AS paid,
        COALESCE(SUM("dueAmount"), 0)::float    AS due,
        COALESCE(SUM("totalProfit"), 0)::float  AS profit,
        COUNT(*)                                AS "invoiceCount"
      FROM invoices
      WHERE "issueDate" >= ${today}
        AND "issueDate" <  ${tomorrow}
        AND status = ${InvoiceStatus.ISSUED}
      GROUP BY "storeId"
    `,

    prisma.$queryRaw<ProductAggRow[]>`
      SELECT
        inv."storeId",
        ii."productId",
        MAX(ii."productName")                            AS "productName",
        COALESCE(MAX(p.sku), '')                         AS "productSku",
        COALESCE(SUM(ii."netQuantity"), 0)::float        AS "quantitySold",
        COALESCE(SUM(ii."totalPrice"), 0)::float         AS revenue,
        COALESCE(SUM(ii."totalProfit"), 0)::float        AS profit
      FROM invoice_items ii
      INNER JOIN invoices inv ON inv.id = ii."invoiceId"
      LEFT JOIN products p ON p.id = ii."productId"
      WHERE inv."issueDate" >= ${today}
        AND inv."issueDate" <  ${tomorrow}
        AND inv.status = ${InvoiceStatus.ISSUED}
        AND ii."productId" IS NOT NULL
      GROUP BY inv."storeId", ii."productId"
    `,

    prisma.$queryRaw<CustomerAggRow[]>`
      SELECT
        inv."storeId",
        inv."customerId",
        COALESCE(c.name, '')                            AS "customerName",
        COUNT(inv.id)                                   AS "invoiceCount",
        COALESCE(SUM(inv.total), 0)::float              AS "totalBilled",
        COALESCE(SUM(inv."paidAmount"), 0)::float       AS "totalPaid",
        COALESCE(SUM(inv."dueAmount"), 0)::float        AS "totalDue"
      FROM invoices inv
      LEFT JOIN customers c ON c.id = inv."customerId"
      WHERE inv."issueDate" >= ${today}
        AND inv."issueDate" <  ${tomorrow}
        AND inv.status = ${InvoiceStatus.ISSUED}
        AND inv."customerId" IS NOT NULL
      GROUP BY inv."storeId", inv."customerId", c.name
    `,
  ]);

  if (
    invoiceRows.length === 0 &&
    productRows.length === 0 &&
    customerRows.length === 0
  ) {
    log.info("[dailyStats] No invoices found for today - skipping.");
    return;
  }

  await Promise.all([
    upsertInvoiceDailyStats(invoiceRows, today),
    upsertProductDailyStats(productRows, today),
    upsertCustomerDailyStats(customerRows, today),
  ]);

  log.info(
    `[dailyStats] Done - invoice: ${invoiceRows.length} store(s), ` +
      `product: ${productRows.length} row(s), customer: ${customerRows.length} row(s).`,
  );
};

export const startDailyStatComputeJob = (): void => {
  // Every hour - recompute all daily stats for today
  cron.schedule("0 * * * *", async () => {
    try {
      await computeDailyStats();
    } catch (err) {
      log.error("[cron] dailyStats failed: " + err);
    }
  });

  log.info("[cron] dailyStats scheduled (every hour).");
};
