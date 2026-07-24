import { CategoryDto } from "./categoryDto";

export enum ProductStockStatus {
  AVAILABLE = "AVAILABLE",
  LOW_STOCK = "LOW_STOCK",
  OUT_OF_STOCK = "OUT_OF_STOCK",
}

export type PricePerQuantityType = {
  id: number;
  price: number;
  quantity: number;
  unit: string;
  profitMargin: number;
};

export type ProductImageType = {
  id: string;
  imageId: string;
  priority: number;
  url: string;
  name: string;
};

export type UnitGroupType = {
  id: number;
  name: string;
  unit: string;
  multiplier: number;
};

export type ProductDto = {
  id: string;
  storeId: string;
  name: string;
  sku: string;
  gtin?: string;
  description?: string;
  categories?: CategoryDto[];
  buyingPricePerQuantity: number;
  totalStock?: number;
  trackInventory?: boolean;
  alertThreshold?: number;
  emailAlert?: boolean;
  stockStatus: ProductStockStatus;
  stockUnit: string;
  pricePerQuantity: PricePerQuantityType[];
  unitGroups?: UnitGroupType[];
  images?: ProductImageType[];
  imageIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
};
