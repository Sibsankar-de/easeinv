import { CategoryDto } from "./categoryDto";

export type DiscountType = "PERCENT" | "FIXED";

export interface CouponDto {
  id: string;
  storeId: string;
  creatorId: string;
  code: string;
  name: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount: number | null;
  minOrderValue: number | null;
  usageLimit: number | null;
  usageCount: number;
  perCustomerLimit: number | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  categories?: CategoryDto[];
  categoryCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CouponCreateUpdateDto {
  name: string;
  code: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount?: number | null;
  minOrderValue?: number | null;
  usageLimit?: number | null;
  perCustomerLimit?: number | null;
  isActive?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  categoryIds?: string[];
  useAllCategories?: boolean;
}
