import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import { paginate } from "../utils/paginate";
import { Prisma, ShippingRuleType, ShippingZoneType } from "@prisma/client";
import { TransactionClient } from "../utils/transactionHandler";
import { PricePerQuantityType } from "../types/productTypes";
import {
  ShippingAddressDto,
  ShippingProfileCreateUpdateDto,
  ShippingProfileQueryDto,
  ShippingRuleCreateUpdateDto,
  ShippingZoneCreateUpdateDto,
} from "../schemas/shipping.schema";
import {
  ShippingCalculationResponseDto,
  ShippingProfileWithCounts,
  toShippingCalculationResponseDto,
  toShippingProfileDto,
  toShippingProfileSummaryDto,
  toShippingRuleDto,
  toShippingZoneDto,
} from "../dto/shipping.dto";

export const getPopulatedShippingProfileById = async (
  profileId: string,
  storeId: string,
) => {
  const profile = await prisma.shippingProfile.findFirst({
    where: {
      id: profileId,
      storeId,
    },
    include: {
      zones: {
        include: {
          rules: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      rules: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!profile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Shipping profile not found");
  }

  return profile;
};

export const createShippingProfile = async (
  storeId: string,
  data: ShippingProfileCreateUpdateDto,
) => {
  const { name, description, isActive } = data;

  const profile = await prisma.shippingProfile.create({
    data: {
      storeId,
      name,
      description: description ?? null,
      isActive: isActive ?? true,
    },
    include: {
      zones: {
        include: {
          rules: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      rules: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  return toShippingProfileDto(profile);
};

export const getShippingProfiles = async (
  storeId: string,
  queryDto: ShippingProfileQueryDto,
) => {
  const { page, limit, query, isActive, sortBy, sortOrder } = queryDto;

  const where: Prisma.ShippingProfileWhereInput = {
    storeId,
  };

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  const orderBy: Prisma.ShippingProfileOrderByWithRelationInput = {
    [sortBy]: sortOrder,
  };

  const result = await paginate(
    prisma.shippingProfile,
    where,
    orderBy,
    { page, limit },
    {
      _count: {
        select: {
          zones: true,
          rules: true,
        },
      },
    },
  );

  return {
    ...result,
    docs: (result.docs as ShippingProfileWithCounts[]).map(
      toShippingProfileSummaryDto,
    ),
  };
};

export const getShippingProfileById = async (
  storeId: string,
  profileId: string,
) => {
  const profile = await getPopulatedShippingProfileById(profileId, storeId);
  return toShippingProfileDto(profile);
};

export const updateShippingProfile = async (
  storeId: string,
  profileId: string,
  data: ShippingProfileCreateUpdateDto,
) => {
  const existingProfile = await prisma.shippingProfile.findFirst({
    where: { id: profileId, storeId },
  });

  if (!existingProfile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Shipping profile not found");
  }

  const updatedProfile = await prisma.shippingProfile.update({
    where: { id: profileId },
    data: {
      name: data.name,
      description:
        data.description !== undefined ? data.description : undefined,
      isActive: data.isActive !== undefined ? data.isActive : undefined,
    },
    include: {
      zones: {
        include: {
          rules: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      rules: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  return toShippingProfileDto(updatedProfile);
};

export const deleteShippingProfile = async (
  storeId: string,
  profileId: string,
) => {
  const existingProfile = await prisma.shippingProfile.findFirst({
    where: { id: profileId, storeId },
  });

  if (!existingProfile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Shipping profile not found");
  }

  await prisma.shippingProfile.delete({
    where: { id: profileId },
  });

  return { success: true, message: "Shipping profile deleted successfully" };
};

export const createShippingZone = async (
  storeId: string,
  profileId: string,
  data: ShippingZoneCreateUpdateDto,
) => {
  const profile = await prisma.shippingProfile.findFirst({
    where: { id: profileId, storeId },
  });

  if (!profile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Shipping profile not found");
  }

  const zone = await prisma.shippingZone.create({
    data: {
      shippingProfileId: profileId,
      name: data.name,
      type: data.type,
      code: data.code,
    },
    include: {
      rules: true,
    },
  });

  return toShippingZoneDto(zone);
};

export const updateShippingZone = async (
  storeId: string,
  zoneId: string,
  data: ShippingZoneCreateUpdateDto,
) => {
  const zone = await prisma.shippingZone.findFirst({
    where: {
      id: zoneId,
      profile: {
        storeId,
      },
    },
  });

  if (!zone) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Shipping zone not found");
  }

  const updatedZone = await prisma.shippingZone.update({
    where: { id: zoneId },
    data: {
      name: data.name,
      type: data.type,
      code: data.code,
    },
    include: {
      rules: true,
    },
  });

  return toShippingZoneDto(updatedZone);
};

export const deleteShippingZone = async (storeId: string, zoneId: string) => {
  const zone = await prisma.shippingZone.findFirst({
    where: {
      id: zoneId,
      profile: {
        storeId,
      },
    },
  });

  if (!zone) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Shipping zone not found");
  }

  await prisma.shippingZone.delete({
    where: { id: zoneId },
  });

  return { success: true, message: "Shipping zone deleted successfully" };
};

export const createShippingRule = async (
  storeId: string,
  data: ShippingRuleCreateUpdateDto,
) => {
  if (data.shippingProfileId) {
    const profile = await prisma.shippingProfile.findFirst({
      where: { id: data.shippingProfileId, storeId },
    });
    if (!profile) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Shipping profile not found");
    }
  }

  if (data.shippingZoneId) {
    const zone = await prisma.shippingZone.findFirst({
      where: {
        id: data.shippingZoneId,
        profile: {
          storeId,
        },
      },
    });
    if (!zone) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Shipping zone not found");
    }
  }

  if (!data.shippingProfileId && !data.shippingZoneId) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Rule must belong to either a shipping profile or a shipping zone",
    );
  }

  const rule = await prisma.shippingRule.create({
    data: {
      shippingProfileId: data.shippingProfileId ?? null,
      shippingZoneId: data.shippingZoneId ?? null,
      type: data.type,
      minValue: data.minValue ?? 0,
      maxValue: data.maxValue ?? null,
      amount: data.amount,
    },
  });

  return toShippingRuleDto(rule);
};

export const updateShippingRule = async (
  storeId: string,
  ruleId: string,
  data: ShippingRuleCreateUpdateDto,
) => {
  const rule = await prisma.shippingRule.findFirst({
    where: {
      id: ruleId,
      OR: [{ profile: { storeId } }, { zone: { profile: { storeId } } }],
    },
  });

  if (!rule) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Shipping rule not found");
  }

  const updatedRule = await prisma.shippingRule.update({
    where: { id: ruleId },
    data: {
      type: data.type,
      minValue: data.minValue,
      maxValue: data.maxValue !== undefined ? data.maxValue : undefined,
      amount: data.amount,
    },
  });

  return toShippingRuleDto(updatedRule);
};

export const deleteShippingRule = async (storeId: string, ruleId: string) => {
  const rule = await prisma.shippingRule.findFirst({
    where: {
      id: ruleId,
      OR: [{ profile: { storeId } }, { zone: { profile: { storeId } } }],
    },
  });

  if (!rule) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Shipping rule not found");
  }

  await prisma.shippingRule.delete({
    where: { id: ruleId },
  });

  return { success: true, message: "Shipping rule deleted successfully" };
};

export interface CalculateShippingItemInput {
  productId: string;
  netQuantity: number;
  stockUnit?: string;
  pricePerQuantity?: PricePerQuantityType;
}

export const calculateShippingCharge = async (
  storeId: string,
  shippingAddress: ShippingAddressDto,
  items: CalculateShippingItemInput[],
  tx: TransactionClient = prisma,
): Promise<ShippingCalculationResponseDto> => {
  // 1. Fetch products for items to calculate subtotal
  const productIds = items.map((i) => i.productId);
  const products = await tx.product.findMany({
    where: { id: { in: productIds }, storeId },
  });

  let subtotal = 0;
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;

    let unitPrice = product.buyingPricePerQuantity;
    if (item.pricePerQuantity) {
      unitPrice =
        item.pricePerQuantity.quantity > 0
          ? item.pricePerQuantity.price / item.pricePerQuantity.quantity
          : item.pricePerQuantity.price;
    } else {
      const productTiers = (
        Array.isArray(product.pricePerQuantity) ? product.pricePerQuantity : []
      ) as PricePerQuantityType[];

      const matchingTier = item.stockUnit
        ? productTiers.find((t) => t.unit === item.stockUnit)
        : productTiers[0];

      if (matchingTier) {
        unitPrice =
          matchingTier.quantity > 0
            ? matchingTier.price / matchingTier.quantity
            : matchingTier.price;
      } else if (product.mrp && product.mrp > 0) {
        unitPrice = product.mrp;
      }
    }
    subtotal += Number((unitPrice * item.netQuantity).toFixed(2));
  }
  subtotal = Number(subtotal.toFixed(2));

  // 2. Fetch active shipping profiles with zones and rules
  const profiles = await tx.shippingProfile.findMany({
    where: { storeId, isActive: true },
    include: {
      zones: {
        include: {
          rules: {
            orderBy: { minValue: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      rules: {
        orderBy: { minValue: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (profiles.length === 0) {
    return toShippingCalculationResponseDto({ subtotal });
  }

  const findMatchingRule = (
    rules: {
      type: ShippingRuleType;
      minValue: number;
      maxValue: number | null;
      amount: number;
      id: string;
    }[],
  ) => {
    return (
      rules.find(
        (r) =>
          r.type === ShippingRuleType.PRICE &&
          r.minValue <= subtotal &&
          (r.maxValue === null || subtotal <= r.maxValue),
      ) || null
    );
  };

  const normPincode = (shippingAddress.pincode || "").trim().toLowerCase();
  const normState = (shippingAddress.state || "").trim().toLowerCase();
  const normCountry = (shippingAddress.country || "").trim().toLowerCase();

  for (const profile of profiles) {
    let matchedZone: (typeof profile.zones)[number] | null = null;

    // A. Match PINCODE
    if (normPincode) {
      matchedZone =
        profile.zones.find((z) => {
          if (z.type !== ShippingZoneType.PINCODE) return false;
          const code = z.code.trim().toLowerCase();
          const name = z.name.trim().toLowerCase();
          return (
            code === normPincode ||
            name === normPincode ||
            code
              .split(",")
              .map((s) => s.trim())
              .includes(normPincode)
          );
        }) || null;
    }

    // B. Match STATE
    if (!matchedZone && normState) {
      matchedZone =
        profile.zones.find((z) => {
          if (z.type !== ShippingZoneType.STATE) return false;
          const code = z.code.trim().toLowerCase();
          const name = z.name.trim().toLowerCase();
          return code === normState || name === normState;
        }) || null;
    }

    // C. Match COUNTRY
    if (!matchedZone && normCountry) {
      matchedZone =
        profile.zones.find((z) => {
          if (z.type !== ShippingZoneType.COUNTRY) return false;
          const code = z.code.trim().toLowerCase();
          const name = z.name.trim().toLowerCase();
          return code === normCountry || name === normCountry;
        }) || null;
    }

    // Evaluate rules: zone rules first if matched and available
    if (matchedZone && matchedZone.rules.length > 0) {
      const matchingRule = findMatchingRule(matchedZone.rules);
      if (matchingRule) {
        return toShippingCalculationResponseDto({
          subtotal,
          profile,
          zone: matchedZone,
          rule: matchingRule,
        });
      }
    }

    // Fallback to profile-level rules
    if (profile.rules.length > 0) {
      const matchingRule = findMatchingRule(profile.rules);
      if (matchingRule) {
        return toShippingCalculationResponseDto({
          subtotal,
          profile,
          zone: matchedZone,
          rule: matchingRule,
        });
      }
    }
  }

  // If no rule matches across profiles, default to 0
  return toShippingCalculationResponseDto({
    subtotal,
    profile: profiles[0] ?? null,
  });
};
