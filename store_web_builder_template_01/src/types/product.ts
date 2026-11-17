export interface ProductCategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null;
  productCount?: number;
}

export interface ProductVariantDTO {
  id: string;
  productId: string;
  sku: string;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  attributes: Record<string, string>; // e.g. { size: "M", color: "Blue" }
  barcode?: string;
  weightGrams?: number;
  isAvailable: boolean;
}

export interface ProductReviewDTO {
  id: string;
  productId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  isVerifiedPurchase: boolean;
}

export interface ProductDTO {
  id: string;
  storeId: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number | null;
  costPerItem?: number;
  sku: string;
  barcode?: string;
  stockQuantity: number;
  isAvailable: boolean;
  isFeatured?: boolean;
  categories: ProductCategoryDTO[];
  tags: string[];
  images: {
    id: string;
    url: string;
    altText?: string;
    isPrimary: boolean;
    sortOrder: number;
  }[];
  variants: ProductVariantDTO[];
  reviews?: ProductReviewDTO[];
  averageRating?: number;
  totalReviews?: number;
  seo?: {
    title?: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponseDTO {
  items: ProductDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
