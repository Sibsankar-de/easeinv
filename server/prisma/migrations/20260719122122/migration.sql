-- AlterTable
ALTER TABLE "customers" ALTER COLUMN "phoneNumber" SET DEFAULT '',
ALTER COLUMN "email" SET DEFAULT '',
ALTER COLUMN "address" SET DEFAULT '';

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0;
