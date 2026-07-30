-- Backfill: create an invoice_summaries row for every store that does not have one.
-- Safe to run multiple times (INSERT ... WHERE NOT EXISTS is idempotent).

INSERT INTO invoice_summaries (
  id,
  "storeId",
  "totalRevenue",
  "totalPaid",
  "totalDue",
  "totalProfit",
  "invoiceCount",
  "totalProductsSold",
  "totalCustomers",
  "paidInvoices",
  "partialInvoices",
  "unpaidInvoices",
  "updatedAt"
)
SELECT
  gen_random_uuid()                       AS id,
  s.id                                    AS "storeId",
  0                                       AS "totalRevenue",
  0                                       AS "totalPaid",
  0                                       AS "totalDue",
  0                                       AS "totalProfit",
  0                                       AS "invoiceCount",
  0                                       AS "totalProductsSold",
  0                                       AS "totalCustomers",
  0                                       AS "paidInvoices",
  0                                       AS "partialInvoices",
  0                                       AS "unpaidInvoices",
  NOW()                                   AS "updatedAt"
FROM stores s
WHERE NOT EXISTS (
  SELECT 1
  FROM invoice_summaries iss
  WHERE iss."storeId" = s.id
);
