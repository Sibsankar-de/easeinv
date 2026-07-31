-- CreateTable
CREATE TABLE "invoice_summaries" (
    "id" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "invoiceCount" INTEGER NOT NULL DEFAULT 0,
    "totalProductsSold" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCustomers" INTEGER NOT NULL DEFAULT 0,
    "paidInvoices" INTEGER NOT NULL DEFAULT 0,
    "partialInvoices" INTEGER NOT NULL DEFAULT 0,
    "unpaidInvoices" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_daily_stats" (
    "id" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "due" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "invoiceCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_daily_stats" (
    "id" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "productId" UUID NOT NULL,
    "productName" TEXT NOT NULL DEFAULT '',
    "productSku" TEXT NOT NULL DEFAULT '',
    "quantitySold" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_daily_stats" (
    "id" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "customerId" UUID NOT NULL,
    "customerName" TEXT NOT NULL DEFAULT '',
    "invoiceCount" INTEGER NOT NULL DEFAULT 0,
    "totalBilled" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoice_summaries_storeId_key" ON "invoice_summaries"("storeId");

-- CreateIndex
CREATE INDEX "invoice_daily_stats_storeId_date_idx" ON "invoice_daily_stats"("storeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_daily_stats_storeId_date_key" ON "invoice_daily_stats"("storeId", "date");

-- CreateIndex
CREATE INDEX "product_daily_stats_storeId_date_idx" ON "product_daily_stats"("storeId", "date");

-- CreateIndex
CREATE INDEX "product_daily_stats_storeId_productId_idx" ON "product_daily_stats"("storeId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_daily_stats_storeId_date_productId_key" ON "product_daily_stats"("storeId", "date", "productId");

-- CreateIndex
CREATE INDEX "customer_daily_stats_storeId_date_idx" ON "customer_daily_stats"("storeId", "date");

-- CreateIndex
CREATE INDEX "customer_daily_stats_storeId_customerId_idx" ON "customer_daily_stats"("storeId", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_daily_stats_storeId_date_customerId_key" ON "customer_daily_stats"("storeId", "date", "customerId");

-- AddForeignKey
ALTER TABLE "invoice_summaries" ADD CONSTRAINT "invoice_summaries_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_daily_stats" ADD CONSTRAINT "invoice_daily_stats_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_daily_stats" ADD CONSTRAINT "product_daily_stats_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_daily_stats" ADD CONSTRAINT "product_daily_stats_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_daily_stats" ADD CONSTRAINT "customer_daily_stats_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_daily_stats" ADD CONSTRAINT "customer_daily_stats_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
