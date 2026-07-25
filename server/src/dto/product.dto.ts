import {
  Product,
  Category,
  GalleryImage,
  ProductImage,
  ProductCategory,
  ProductStockStatus,
} from "@prisma/client";
import { PricePerQuantityDto, UnitGroupDto } from "../schemas/product.schema";
import { productExtraDataConverter } from "../converters/product.converter";

export interface CategoryDto {
  id: string;
  storeId?: string;
  name: string;
}

export interface ProductImageDto {
  id: string;
  priority: number;
  imageId: string;
  url: string;
  name: string;
}

export interface ProductImageWithImage {
  id: string;
  priority: number;
  imageId: string;
  image: GalleryImage;
}

export interface ProductResponseDto {
  id: string;
  userId: string;
  storeId: string;
  name: string;
  sku: string;
  gtin: string | null;
  description: string | null;
  thumbnailImageId: string | null;
  buyingPricePerQuantity: number;
  totalStock: number;
  trackInventory: boolean;
  alertThreshold: number;
  emailAlert: boolean;
  stockUnit: string;
  stockStatus: ProductStockStatus;
  unitGroups: UnitGroupDto[];
  pricePerQuantity: PricePerQuantityDto[];
  categories: CategoryDto[];
  images: ProductImageDto[];
  lastStockAmount: number;
  lastStockAddedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSummaryResponseDto {
  id: string;
  name: string;
  sku: string;
  buyingPricePerQuantity: number;
  totalStock: number;
  stockUnit: string;
  pricePerQuantity: PricePerQuantityDto[];
  unitGroups: UnitGroupDto[];
  stockStatus: ProductStockStatus;
  alertThreshold: number;
  createdAt: Date;
  categories: CategoryDto[];
}

export const toProductDto = (
  product: Product,
  categories: Category[],
  images: (ProductImage & { image: GalleryImage })[],
): ProductResponseDto => {
  const extraData = productExtraDataConverter(product.extraData);
  return {
    id: product.id,
    userId: product.userId,
    storeId: product.storeId,
    name: product.name,
    sku: product.sku,
    gtin: product.gtin,
    description: product.description,
    thumbnailImageId: product.thumbnailImageId,
    buyingPricePerQuantity: product.buyingPricePerQuantity,
    totalStock: product.totalStock,
    trackInventory: product.trackInventory,
    alertThreshold: product.alertThreshold,
    emailAlert: product.emailAlert,
    stockStatus: product.stockStatus,
    stockUnit: product.stockUnit,
    unitGroups: (product.unitGroups as UnitGroupDto[]) ?? [],
    pricePerQuantity: (product.pricePerQuantity as PricePerQuantityDto[]) ?? [],
    categories: categories.map((c) => ({
      id: c.id,
      storeId: c.storeId,
      name: c.name,
    })),
    images: images.map((img) => ({
      id: img.id,
      priority: img.priority,
      imageId: img.imageId,
      url: img.image.url,
      name: img.image.name,
    })),
    lastStockAmount: extraData.lastStockAmount,
    lastStockAddedAt: extraData.lastStockAddedAt,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

export const toProductSummaryDto = (
  product: Product & {
    categories?: (ProductCategory & { category: Category })[];
  },
): ProductSummaryResponseDto => {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    buyingPricePerQuantity: product.buyingPricePerQuantity,
    totalStock: product.totalStock,
    stockUnit: product.stockUnit,
    pricePerQuantity: (product.pricePerQuantity as PricePerQuantityDto[]) ?? [],
    unitGroups: (product.unitGroups as UnitGroupDto[]) ?? [],
    stockStatus: product.stockStatus,
    alertThreshold: product.alertThreshold,
    createdAt: product.createdAt,
    categories: product.categories
      ? product.categories.map((pc) => ({
          id: pc.category.id,
          storeId: pc.category.storeId,
          name: pc.category.name,
        }))
      : [],
  };
};

export const toProductSummaryListDto = (
  products: (Product & {
    categories?: (ProductCategory & { category: Category })[];
  })[],
): ProductSummaryResponseDto[] => {
  return products.map(toProductSummaryDto);
};

export const toPaginatedProductsDto = (paginatedResult: {
  docs: (Product & {
    categories?: (ProductCategory & { category: Category })[];
  })[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}) => {
  return {
    ...paginatedResult,
    docs: toProductSummaryListDto(paginatedResult.docs),
  };
};
