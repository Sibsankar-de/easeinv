import { BadgeVariant } from "@/components/ui/Badge";
import { ProductStockStatus } from "@/types/dto/productDto";

export const StockStatusMap = {
  [ProductStockStatus.AVAILABLE]: "In stock",
  [ProductStockStatus.LOW_STOCK]: "Low stock",
  [ProductStockStatus.OUT_OF_STOCK]: "Out of stock",
};

export const StockStatusBadgeVariantMap: Record<
  ProductStockStatus,
  BadgeVariant
> = {
  [ProductStockStatus.AVAILABLE]: "success",
  [ProductStockStatus.LOW_STOCK]: "warning",
  [ProductStockStatus.OUT_OF_STOCK]: "danger",
};
