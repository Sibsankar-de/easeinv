export enum ShippingZoneType {
  COUNTRY = "COUNTRY",
  STATE = "STATE",
  CITY = "CITY",
  PINCODE = "PINCODE",
}

export enum ShippingRuleType {
  FLAT = "FLAT",
  WEIGHT_BASED = "WEIGHT_BASED",
  PRICE_BASED = "PRICE_BASED",
}

export interface ShippingRuleDto {
  id: string;
  profileId: string | null;
  zoneId: string | null;
  name: string;
  type: ShippingRuleType;
  rate: number;
  minValue: number | null;
  maxValue: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingZoneDto {
  id: string;
  profileId: string;
  name: string;
  type: ShippingZoneType;
  code: string;
  rules: ShippingRuleDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ShippingProfileDto {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
  fallbackRate: number;
  zones: ShippingZoneDto[];
  rules: ShippingRuleDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ShippingProfileSummaryDto {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
  fallbackRate: number;
  zoneCount: number;
  ruleCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingProfileCreateUpdateDto {
  name: string;
  description?: string | null;
  isDefault?: boolean;
  isActive?: boolean;
  fallbackRate?: number;
}

export interface ShippingZoneCreateUpdateDto {
  name: string;
  type: ShippingZoneType;
  code: string;
}

export interface ShippingRuleCreateUpdateDto {
  profileId?: string | null;
  zoneId?: string | null;
  name: string;
  type: ShippingRuleType;
  rate: number;
  minValue?: number | null;
  maxValue?: number | null;
}

export interface ShippingAddressDto {
  addressLine: string;
  city?: string;
  state?: string;
  pincode?: string;
  country: string;
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
