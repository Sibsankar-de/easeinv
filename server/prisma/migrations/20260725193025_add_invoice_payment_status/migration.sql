-- CreateEnum
CREATE TYPE "InvoicePaymentStatus" AS ENUM ('PAID', 'DUE', 'OVERDUE');

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "paymentStatus" "InvoicePaymentStatus" NOT NULL DEFAULT 'PAID';

-- AlterTable
ALTER TABLE "store_settings" ALTER COLUMN "enableInventoryTracking" SET DEFAULT true;

-- CreateIndex
CREATE INDEX "invoices_storeId_paymentStatus_idx" ON "invoices"("storeId", "paymentStatus");
