-- DropForeignKey
ALTER TABLE "invoice_items" DROP CONSTRAINT "invoice_items_productId_fkey";

-- AlterTable
ALTER TABLE "invoice_items" ADD COLUMN     "productName" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "productId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
