-- CreateEnum
CREATE TYPE "ProductStockStatus" AS ENUM ('AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "stockStatus" "ProductStockStatus" NOT NULL DEFAULT 'AVAILABLE';
