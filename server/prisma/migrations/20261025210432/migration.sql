-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "eventLogs" JSONB NOT NULL DEFAULT '[]';
