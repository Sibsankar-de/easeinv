import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import { paginate } from "../utils/paginate";
import {
  prismaTransaction,
  TransactionClient,
} from "../utils/transactionHandler";
import { CouponCreateUpdateDTO } from "../schemas/coupon.schema";
import {
  toCouponDto,
  toCouponSummaryDto,
  CouponWithCategories,
  CouponWithCategoryCount,
} from "../dto/coupon.dto";
import { DiscountType, Prisma } from "@prisma/client";

export const ensureUniqueCouponCode = async (
  storeId: string,
  code: string,
  currentCouponId?: string,
  tx: TransactionClient = prisma,
) => {
  const existingCoupon = await tx.coupon.findFirst({
    where: {
      storeId,
      code,
      ...(currentCouponId ? { id: { not: currentCouponId } } : {}),
    },
  });

  if (existingCoupon) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      `Coupon with code "${code}" already exists in this store`,
    );
  }
};

export const addOrRemoveCouponCategory = async (
  couponId: string,
  categoryIds: string[],
  tx: TransactionClient = prisma,
) => {
  const existingCategories = await tx.couponCategory.findMany({
    where: { couponId },
  });
  const existingCategoryIds = existingCategories.map((c) => c.categoryId);

  const categoriesToAdd = categoryIds.filter(
    (c) => !existingCategoryIds.includes(c),
  );
  const categoriesToRemove = existingCategoryIds.filter(
    (c) => !categoryIds.includes(c),
  );

  // create required categories
  if (categoriesToAdd.length > 0) {
    await tx.couponCategory.createMany({
      data: categoriesToAdd.map((categoryId) => ({
        couponId,
        categoryId,
      })),
      skipDuplicates: true,
    });
  }

  // delete removed categories
  if (categoriesToRemove.length > 0) {
    await tx.couponCategory.deleteMany({
      where: {
        couponId,
        categoryId: { in: categoriesToRemove },
      },
    });
  }
};

export const resolveCategoryIds = async (
  storeId: string,
  categoryIds: string[] | undefined,
  useAllCategories: boolean | undefined,
  tx: TransactionClient = prisma,
): Promise<string[]> => {
  if (useAllCategories) {
    const storeCategories = await tx.category.findMany({
      where: { storeId },
      select: { id: true },
    });
    return storeCategories.map((c) => c.id);
  }
  return categoryIds ?? [];
};

export const getPopulatedCouponById = async (
  couponId: string,
  storeId?: string,
  tx: TransactionClient = prisma,
): Promise<CouponWithCategories> => {
  const coupon = await tx.coupon.findFirst({
    where: {
      id: couponId,
      ...(storeId ? { storeId } : {}),
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!coupon) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Coupon not found");
  }

  return coupon;
};

export const createCoupon = async (
  storeId: string,
  creatorId: string,
  couponData: CouponCreateUpdateDTO,
) =>
  prismaTransaction(async (tx) => {
    const {
      name,
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minOrderValue,
      usageLimit,
      perCustomerLimit,
      isActive,
      startsAt,
      endsAt,
      categoryIds,
      useAllCategories,
    } = couponData;

    await ensureUniqueCouponCode(storeId, code, undefined, tx);

    const targetCategoryIds = await resolveCategoryIds(
      storeId,
      categoryIds,
      useAllCategories,
      tx,
    );

    const coupon = await tx.coupon.create({
      data: {
        storeId,
        creatorId,
        name,
        code,
        description: description ?? null,
        discountType,
        discountValue,
        maxDiscount: maxDiscount ?? null,
        minOrderValue: minOrderValue ?? 0,
        usageLimit: usageLimit ?? null,
        perCustomerLimit: perCustomerLimit ?? null,
        isActive: isActive ?? true,
        startsAt: startsAt ?? null,
        endsAt: endsAt ?? null,
      },
    });

    if (targetCategoryIds.length > 0) {
      await addOrRemoveCouponCategory(coupon.id, targetCategoryIds, tx);
    }

    const populated = await getPopulatedCouponById(coupon.id, storeId, tx);
    return toCouponDto(populated);
  });

export const updateCoupon = async (
  storeId: string,
  couponId: string,
  couponData: CouponCreateUpdateDTO,
) =>
  prismaTransaction(async (tx) => {
    const {
      name,
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minOrderValue,
      usageLimit,
      perCustomerLimit,
      isActive,
      startsAt,
      endsAt,
      categoryIds,
      useAllCategories,
    } = couponData;

    const existingCoupon = await tx.coupon.findFirst({
      where: { id: couponId, storeId },
    });

    if (!existingCoupon) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Coupon not found");
    }

    await ensureUniqueCouponCode(storeId, code, couponId, tx);

    const targetCategoryIds = await resolveCategoryIds(
      storeId,
      categoryIds,
      useAllCategories,
      tx,
    );

    await tx.coupon.update({
      where: { id: couponId },
      data: {
        name,
        code,
        description: description ?? null,
        discountType,
        discountValue,
        maxDiscount: maxDiscount ?? null,
        minOrderValue: minOrderValue ?? 0,
        usageLimit: usageLimit ?? null,
        perCustomerLimit: perCustomerLimit ?? null,
        isActive: isActive ?? true,
        startsAt: startsAt ?? null,
        endsAt: endsAt ?? null,
      },
    });

    await addOrRemoveCouponCategory(couponId, targetCategoryIds, tx);

    const populated = await getPopulatedCouponById(couponId, storeId, tx);
    return toCouponDto(populated);
  });

export const deleteCoupon = async (storeId: string, couponId: string) => {
  const existingCoupon = await prisma.coupon.findFirst({
    where: { id: couponId, storeId },
  });

  if (!existingCoupon) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Coupon not found");
  }

  await prisma.coupon.delete({
    where: { id: couponId },
  });

  return { success: true, message: "Coupon deleted successfully" };
};

export const getCouponById = async (storeId: string, couponId: string) => {
  const coupon = await getPopulatedCouponById(couponId, storeId);
  return toCouponDto(coupon);
};

export const getCoupons = async (params: {
  storeId: string;
  page: number;
  limit: number;
  query?: string;
  isActive?: boolean;
  discountType?: DiscountType;
  categoryId?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) => {
  const {
    storeId,
    page,
    limit,
    query,
    isActive,
    discountType,
    categoryId,
    sortBy,
    sortOrder,
  } = params;

  const where: Prisma.CouponWhereInput = { storeId };

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { code: { contains: query, mode: "insensitive" } },
    ];
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (discountType) {
    where.discountType = discountType;
  }

  if (categoryId) {
    where.categories = {
      some: { categoryId },
    };
  }

  const result = await paginate(
    prisma.coupon,
    where,
    { [sortBy]: sortOrder },
    { page, limit },
    {
      _count: {
        select: {
          categories: true,
        },
      },
    },
  );

  return {
    ...result,
    docs: (result.docs as CouponWithCategoryCount[]).map(toCouponSummaryDto),
  };
};
