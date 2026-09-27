import { Category, Coupon, DiscountType } from "@prisma/client";
import { CategoryDto, toCategoryDto } from "./category.dto";

export interface CouponResponseDto {
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
  startsAt: Date | null;
  endsAt: Date | null;
  categories: CategoryDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponSummaryResponseDto {
  id: string;
  storeId: string;
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
  startsAt: Date | null;
  endsAt: Date | null;
  categoryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CouponWithCategories = Coupon & {
  categories: {
    category: Category;
  }[];
};

export type CouponWithCategoryCount = Coupon & {
  _count?: {
    categories: number;
  };
  categories?: {
    category: Category;
  }[];
};

export const toCouponDto = (coupon: CouponWithCategories): CouponResponseDto => {
  return {
    id: coupon.id,
    storeId: coupon.storeId,
    creatorId: coupon.creatorId,
    code: coupon.code,
    name: coupon.name,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    maxDiscount: coupon.maxDiscount,
    minOrderValue: coupon.minOrderValue,
    usageLimit: coupon.usageLimit,
    usageCount: coupon.usageCount,
    perCustomerLimit: coupon.perCustomerLimit,
    isActive: coupon.isActive,
    startsAt: coupon.startsAt,
    endsAt: coupon.endsAt,
    categories: coupon.categories.map((c) => toCategoryDto(c.category)),
    createdAt: coupon.createdAt,
    updatedAt: coupon.updatedAt,
  };
};

export const toCouponSummaryDto = (
  coupon: CouponWithCategoryCount,
): CouponSummaryResponseDto => {
  const categoryCount =
    coupon._count?.categories ??
    (coupon.categories ? coupon.categories.length : 0);

  return {
    id: coupon.id,
    storeId: coupon.storeId,
    code: coupon.code,
    name: coupon.name,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    maxDiscount: coupon.maxDiscount,
    minOrderValue: coupon.minOrderValue,
    usageLimit: coupon.usageLimit,
    usageCount: coupon.usageCount,
    perCustomerLimit: coupon.perCustomerLimit,
    isActive: coupon.isActive,
    startsAt: coupon.startsAt,
    endsAt: coupon.endsAt,
    categoryCount,
    createdAt: coupon.createdAt,
    updatedAt: coupon.updatedAt,
  };
};
