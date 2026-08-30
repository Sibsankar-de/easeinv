import {
  ShippingProfile,
  ShippingRule,
  ShippingRuleType,
  ShippingZone,
  ShippingZoneType,
} from "@prisma/client";

export interface ShippingRuleResponseDto {
  id: string;
  shippingProfileId: string | null;
  shippingZoneId: string | null;
  type: ShippingRuleType;
  minValue: number;
  maxValue: number | null;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingZoneResponseDto {
  id: string;
  shippingProfileId: string;
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
  isActive: boolean;
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
  isActive: boolean;
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

export const toShippingRuleDto = (
  rule: ShippingRule,
): ShippingRuleResponseDto => ({
  id: rule.id,
  shippingProfileId: rule.shippingProfileId,
  shippingZoneId: rule.shippingZoneId,
  type: rule.type,
  minValue: rule.minValue,
  maxValue: rule.maxValue,
  amount: rule.amount,
  createdAt: rule.createdAt,
  updatedAt: rule.updatedAt,
});

export const toShippingZoneDto = (
  zone: ShippingZoneWithRules,
): ShippingZoneResponseDto => ({
  id: zone.id,
  shippingProfileId: zone.shippingProfileId,
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
  isActive: profile.isActive,
  zones: (profile.zones || []).map(toShippingZoneDto),
  rules: (profile.rules || []).map(toShippingRuleDto),
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
});

export const toShippingProfileSummaryDto = (
  profile: ShippingProfileWithCounts,
): ShippingProfileSummaryResponseDto => {
  const zoneCount =
    profile._count?.zones ?? (profile.zones ? profile.zones.length : 0);
  const ruleCount =
    profile._count?.rules ?? (profile.rules ? profile.rules.length : 0);

  return {
    id: profile.id,
    storeId: profile.storeId,
    name: profile.name,
    description: profile.description,
    isActive: profile.isActive,
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
  rule?: { id: string; type: ShippingRuleType; amount: number } | null;
}

export const toShippingCalculationResponseDto = (
  params: ShippingCalculationParams,
): ShippingCalculationResponseDto => ({
  shippingAmount: params.rule?.amount ?? params.shippingAmount ?? 0,
  subtotal: params.subtotal,
  matchedProfileId: params.profile?.id ?? null,
  matchedProfileName: params.profile?.name ?? null,
  matchedZoneId: params.zone?.id ?? null,
  matchedZoneName: params.zone?.name ?? null,
  matchedZoneType: params.zone?.type ?? null,
  matchedRuleId: params.rule?.id ?? null,
  matchedRuleType: params.rule?.type ?? null,
});
