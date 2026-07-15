import type { Product, Category } from "@prisma/client";

// JSON field shape stored in Product.pricePerQuantity
export interface PricePerQuantityEntry {
  id: number;
  price: number;
  quantity: number;
  profitMargin: number;
}

export type PopulatedProduct = Product & {
  categories: Category[];
  images: {
    id: string;
    priority: number;
    imageId: string;
    url: string;
    name: string;
  }[];
};
