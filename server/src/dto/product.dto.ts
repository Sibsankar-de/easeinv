import { Product, Category, GalleryImage, ProductImage } from "@prisma/client";
import { PricePerQuantityDto, UnitGroupDto } from "../schemas/product.schema";

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
  unitGroups: UnitGroupDto[];
  pricePerQuantity: PricePerQuantityDto[];
  categories: CategoryDto[];
  images: ProductImageDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSummaryResponseDto {
  id: string;
  name: string;
  sku: string;
  buyingPricePerQuantity: number;
  stockUnit: string;
  pricePerQuantity: PricePerQuantityDto[];
  createdAt: Date;
}

export const toProductDto = (
  product: Product,
  categories: Category[],
  images: (ProductImage & { image: GalleryImage })[],
): ProductResponseDto => {
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
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

export const toProductSummaryDto = (
  product: Product,
): ProductSummaryResponseDto => {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    buyingPricePerQuantity: product.buyingPricePerQuantity,
    stockUnit: product.stockUnit,
    pricePerQuantity: (product.pricePerQuantity as PricePerQuantityDto[]) ?? [],
    createdAt: product.createdAt,
  };
};

export const toProductSummaryListDto = (
  products: Product[],
): ProductSummaryResponseDto[] => {
  return products.map(toProductSummaryDto);
};

export const toPaginatedProductsDto = (paginatedResult: {
  docs: Product[];
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
