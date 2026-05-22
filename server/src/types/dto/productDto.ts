export type PricePerQuantityType = {
  id: number;
  price: number;
  quantity: number;
  profitMargin: number;
};

export type ProductDto = {
  _id: string;
  storeId: string;
  name: string;
  sku: string;
  gtin?: string;
  description?: string;
  categories?: string[];
  buyingPricePerQuantity: number;
  totalStock?: number;
  enableInventoryTracking?: boolean;
  stockUnit: string;
  pricePerQuantity: PricePerQuantityType[];
  createdAt?: Date;
  updatedAt?: Date;
};
