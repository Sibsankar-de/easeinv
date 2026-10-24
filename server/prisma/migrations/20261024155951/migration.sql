-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "useAllCategories" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "invoice_items" ADD COLUMN     "couponCode" TEXT,
ADD COLUMN     "couponDiscount" DOUBLE PRECISION;
