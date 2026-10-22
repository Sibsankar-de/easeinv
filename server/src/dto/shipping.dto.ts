import {
  ShippingProfile,
  ShippingRule,
  ShippingRuleType,
  ShippingZone,
  ShippingZoneType,
} from "@prisma/client";

export interface ShippingRuleResponseDto {
  id: string;
  profileId: string | null;
  zoneId: string | null;
  name: string;
  type: ShippingRuleType;
  rate: number;
  minValue: number | null;
  maxValue: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingZoneResponseDto {
  id: string;
  profileId: string;
  name: string;
  type: ShippingZoneType;
  code: string;
  rules: ShippingRuleResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingProfileResponseDto {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
  fallbackRate: number;
  zones: ShippingZoneResponseDto[];
  rules: ShippingRuleResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingProfileSummaryResponseDto {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
  fallbackRate: number;
  zoneCount: number;
  ruleCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingCalculationResponseDto {
  shippingAmount: number;
  subtotal: number;
  matchedProfileId: string | null;
  matchedProfileName: string | null;
  matchedZoneId: string | null;
  matchedZoneName: string | null;
  matchedZoneType: ShippingZoneType | null;
  matchedRuleId: string | null;
  matchedRuleType: ShippingRuleType | null;
}

export type ShippingZoneWithRules = ShippingZone & {
  rules?: ShippingRule[];
};

export type ShippingProfileWithRelations = ShippingProfile & {
  zones: (ShippingZone & {
    rules?: ShippingRule[];
  })[];
  rules: ShippingRule[];
};

export type ShippingProfileWithCounts = ShippingProfile & {
  _count?: {
    zones: number;
    rules: number;
  };
  zones?: ShippingZone[];
  rules?: ShippingRule[];
};

export const toShippingRuleDto = (rule: ShippingRule): ShippingRuleResponseDto => ({
  id: rule.id,
  profileId: rule.profileId,
  zoneId: rule.zoneId,
  name: rule.name,
  type: rule.type,
  rate: rule.rate,
  minValue: rule.minValue,
  maxValue: rule.maxValue,
  createdAt: rule.createdAt,
  updatedAt: rule.updatedAt,
});

export const toShippingZoneDto = (zone: ShippingZoneWithRules): ShippingZoneResponseDto => ({
  id: zone.id,
  profileId: zone.profileId,
  name: zone.name,
  type: zone.type,
  code: zone.code,
  rules: (zone.rules || []).map(toShippingRuleDto),
  createdAt: zone.createdAt,
  updatedAt: zone.updatedAt,
});

export const toShippingProfileDto = (
  profile: ShippingProfileWithRelations,
): ShippingProfileResponseDto => ({
  id: profile.id,
  storeId: profile.storeId,
  name: profile.name,
  description: profile.description,
  isDefault: profile.isDefault,
  isActive: profile.isActive,
  fallbackRate: profile.fallbackRate,
  zones: (profile.zones || []).map(toShippingZoneDto),
  rules: (profile.rules || []).map(toShippingRuleDto),
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
});

export const toShippingProfileSummaryDto = (
  profile: ShippingProfileWithCounts,
): ShippingProfileSummaryResponseDto => {
  const zoneCount = profile._count?.zones ?? (profile.zones ? profile.zones.length : 0);
  const ruleCount = profile._count?.rules ?? (profile.rules ? profile.rules.length : 0);

  return {
    id: profile.id,
    storeId: profile.storeId,
    name: profile.name,
    description: profile.description,
    isDefault: profile.isDefault,
    isActive: profile.isActive,
    fallbackRate: profile.fallbackRate,
    zoneCount,
    ruleCount,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
};

export interface ShippingCalculationParams {
  subtotal: number;
  shippingAmount?: number;
  profile?: { id: string; name: string } | null;
  zone?: { id: string; name: string; type: ShippingZoneType } | null;
  rule?: { id: string; type: ShippingRuleType; rate: number } | null;
}

export const toShippingCalculationResponseDto = (
  params: ShippingCalculationParams,
): ShippingCalculationResponseDto => ({
  shippingAmount: params.rule?.rate ?? params.shippingAmount ?? 0,
  subtotal: params.subtotal,
  matchedProfileId: params.profile?.id ?? null,
  matchedProfileName: params.profile?.name ?? null,
  matchedZoneId: params.zone?.id ?? null,
  matchedZoneName: params.zone?.name ?? null,
  matchedZoneType: params.zone?.type ?? null,
  matchedRuleId: params.rule?.id ?? null,
  matchedRuleType: params.rule?.type ?? null,
});
