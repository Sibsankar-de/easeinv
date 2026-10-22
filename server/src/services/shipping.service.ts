import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import { paginate } from "../utils/paginate";
import { Prisma, ShippingRuleType, ShippingZoneType } from "@prisma/client";
import {
  prismaTransaction,
  TransactionClient,
} from "../utils/transactionHandler";
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

const profileInclude = {
  zones: {
    include: { rules: true },
    orderBy: { createdAt: "asc" as const },
  },
  rules: {
    orderBy: { createdAt: "asc" as const },
  },
};

export const getPopulatedShippingProfileById = async (
  profileId: string,
  storeId: string,
) => {
  const profile = await prisma.shippingProfile.findFirst({
    where: { id: profileId, storeId },
    include: profileInclude,
  });

  if (!profile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Shipping profile not found");
  }

  return profile;
};

export const createShippingProfile = async (
  storeId: string,
  data: ShippingProfileCreateUpdateDto,
) =>
  prismaTransaction(async (tx) => {
    const { name, description, isDefault, isActive, fallbackRate } = data;

    if (isDefault) {
      await tx.shippingProfile.updateMany({
        where: { storeId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const profile = await tx.shippingProfile.create({
      data: {
        storeId,
        name,
        description: description ?? null,
        isDefault: isDefault ?? false,
        isActive: isActive ?? true,
        fallbackRate: fallbackRate ?? 0,
      },
      include: profileInclude,
    });

    return toShippingProfileDto(profile);
  });

export const getShippingProfiles = async (
  storeId: string,
  queryDto: ShippingProfileQueryDto,
) => {
  const { page, limit, query, isActive, sortBy, sortOrder } = queryDto;

  const where: Prisma.ShippingProfileWhereInput = { storeId };

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
        select: { zones: true, rules: true },
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
) =>
  prismaTransaction(async (tx) => {
    const existing = await tx.shippingProfile.findFirst({
      where: { id: profileId, storeId },
    });

    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Shipping profile not found");
    }

    if (data.isDefault && !existing.isDefault) {
      await tx.shippingProfile.updateMany({
        where: { storeId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await tx.shippingProfile.update({
      where: { id: profileId },
      data: {
        name: data.name,
        description:
          data.description !== undefined ? data.description : undefined,
        isDefault: data.isDefault !== undefined ? data.isDefault : undefined,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
        fallbackRate:
          data.fallbackRate !== undefined ? data.fallbackRate : undefined,
      },
      include: profileInclude,
    });

    return toShippingProfileDto(updated);
  });

export const deleteShippingProfile = async (
  storeId: string,
  profileId: string,
) => {
  const existing = await prisma.shippingProfile.findFirst({
    where: { id: profileId, storeId },
  });

  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Shipping profile not found");
  }

  await prisma.shippingProfile.delete({ where: { id: profileId } });

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
      profileId,
      name: data.name,
      type: data.type,
      code: data.code,
    },
    include: { rules: true },
  });

  return toShippingZoneDto(zone);
};

export const updateShippingZone = async (
  storeId: string,
  zoneId: string,
  data: ShippingZoneCreateUpdateDto,
) => {
  const zone = await prisma.shippingZone.findFirst({
    where: { id: zoneId, profile: { storeId } },
  });

  if (!zone) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Shipping zone not found");
  }

  const updated = await prisma.shippingZone.update({
    where: { id: zoneId },
    data: {
      name: data.name,
      type: data.type,
      code: data.code,
    },
    include: { rules: true },
  });

  return toShippingZoneDto(updated);
};

export const deleteShippingZone = async (storeId: string, zoneId: string) => {
  const zone = await prisma.shippingZone.findFirst({
    where: { id: zoneId, profile: { storeId } },
  });

  if (!zone) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Shipping zone not found");
  }

  await prisma.shippingZone.delete({ where: { id: zoneId } });

  return { success: true, message: "Shipping zone deleted successfully" };
};

export const createShippingRule = async (
  storeId: string,
  data: ShippingRuleCreateUpdateDto,
) => {
  if (!data.profileId && !data.zoneId) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Rule must belong to either a shipping profile or a shipping zone",
    );
  }

  if (data.profileId) {
    const profile = await prisma.shippingProfile.findFirst({
      where: { id: data.profileId, storeId },
    });
    if (!profile) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Shipping profile not found");
    }
  }

  if (data.zoneId) {
    const zone = await prisma.shippingZone.findFirst({
      where: { id: data.zoneId, profile: { storeId } },
    });
    if (!zone) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Shipping zone not found");
    }
  }

  const rule = await prisma.shippingRule.create({
    data: {
      profileId: data.profileId ?? null,
      zoneId: data.zoneId ?? null,
      name: data.name,
      type: data.type,
      rate: data.rate,
      minValue: data.minValue ?? null,
      maxValue: data.maxValue ?? null,
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

  const updated = await prisma.shippingRule.update({
    where: { id: ruleId },
    data: {
      name: data.name,
      type: data.type,
      rate: data.rate,
      minValue: data.minValue !== undefined ? data.minValue : undefined,
      maxValue: data.maxValue !== undefined ? data.maxValue : undefined,
    },
  });

  return toShippingRuleDto(updated);
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

  await prisma.shippingRule.delete({ where: { id: ruleId } });

  return { success: true, message: "Shipping rule deleted successfully" };
};

export const calculateShippingCharge = async (
  storeId: string,
  shippingAddress: ShippingAddressDto,
  subtotal: number,
  tx: TransactionClient = prisma,
): Promise<ShippingCalculationResponseDto> => {
  const profiles = await tx.shippingProfile.findMany({
    where: { storeId, isActive: true },
    include: {
      zones: {
        include: { rules: { orderBy: { minValue: "asc" } } },
        orderBy: { createdAt: "asc" },
      },
      rules: { orderBy: { minValue: "asc" } },
    },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  if (profiles.length === 0) {
    return toShippingCalculationResponseDto({ subtotal });
  }

  const normPincode = (shippingAddress.pincode || "").trim().toLowerCase();
  const normCity = (shippingAddress.city || "").trim().toLowerCase();
  const normState = (shippingAddress.state || "").trim().toLowerCase();
  const normCountry = (shippingAddress.country || "").trim().toLowerCase();

  const isZoneMatch = (zone: (typeof profiles)[number]["zones"][number]) => {
    const code = zone.code.trim().toLowerCase();
    const name = zone.name.trim().toLowerCase();

    switch (zone.type) {
      case ShippingZoneType.PINCODE:
        return (
          !!normPincode &&
          (code === normPincode ||
            code.split(",").map((s) => s.trim()).includes(normPincode))
        );
      case ShippingZoneType.CITY:
        return !!normCity && (code === normCity || name === normCity);
      case ShippingZoneType.STATE:
        return !!normState && (code === normState || name === normState);
      case ShippingZoneType.COUNTRY:
        return !!normCountry && (code === normCountry || name === normCountry);
      default:
        return false;
    }
  };

  const isRuleMatch = (rule: (typeof profiles)[number]["rules"][number]) => {
    if (rule.type === ShippingRuleType.FLAT) return true;
    if (rule.type === ShippingRuleType.PRICE_BASED) {
      const min = rule.minValue ?? 0;
      return subtotal >= min && (rule.maxValue === null || subtotal <= rule.maxValue);
    }
    return false;
  };

  for (const profile of profiles) {
    const matchedZone =
      profile.zones.find((z) => z.type === ShippingZoneType.PINCODE && isZoneMatch(z)) ??
      profile.zones.find((z) => z.type === ShippingZoneType.CITY && isZoneMatch(z)) ??
      profile.zones.find((z) => z.type === ShippingZoneType.STATE && isZoneMatch(z)) ??
      profile.zones.find((z) => z.type === ShippingZoneType.COUNTRY && isZoneMatch(z)) ??
      null;

    const matchingRule =
      matchedZone?.rules.find(isRuleMatch) ??
      profile.rules.find(isRuleMatch) ??
      null;

    if (matchingRule) {
      return toShippingCalculationResponseDto({
        subtotal,
        profile,
        zone: matchedZone,
        rule: matchingRule,
      });
    }

    if (profile.fallbackRate > 0) {
      return toShippingCalculationResponseDto({
        subtotal,
        shippingAmount: profile.fallbackRate,
        profile,
        zone: matchedZone,
      });
    }
  }

  return toShippingCalculationResponseDto({
    subtotal,
    profile: profiles[0] ?? null,
  });
};
