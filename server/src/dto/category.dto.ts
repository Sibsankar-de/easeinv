import { Category } from "@prisma/client";

export interface CategoryDto {
  id: string;
  storeId?: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const toCategoryDto = (category: Category): CategoryDto => {
  return {
    id: category.id,
    storeId: category.storeId,
    name: category.name,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
};
