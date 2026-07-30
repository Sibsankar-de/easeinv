/*
  Warnings:

  - A unique constraint covering the columns `[storeId,date,customerId]` on the table `customer_daily_stats` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,date,productId]` on the table `product_daily_stats` will be added. If there are existing duplicate values, this will fail.
  - Made the column `customerId` on table `customer_daily_stats` required. This step will fail if there are existing NULL values in that column.
  - Made the column `productId` on table `product_daily_stats` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "customer_daily_stats" DROP CONSTRAINT "customer_daily_stats_customerId_fkey";

-- DropForeignKey
ALTER TABLE "product_daily_stats" DROP CONSTRAINT "product_daily_stats_productId_fkey";

-- AlterTable
ALTER TABLE "customer_daily_stats" ALTER COLUMN "customerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "product_daily_stats" ALTER COLUMN "productId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "customer_daily_stats_storeId_date_customerId_key" ON "customer_daily_stats"("storeId", "date", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "product_daily_stats_storeId_date_productId_key" ON "product_daily_stats"("storeId", "date", "productId");

-- AddForeignKey
ALTER TABLE "product_daily_stats" ADD CONSTRAINT "product_daily_stats_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_daily_stats" ADD CONSTRAINT "customer_daily_stats_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
