import type { Product, Category } from "@prisma/client";

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
