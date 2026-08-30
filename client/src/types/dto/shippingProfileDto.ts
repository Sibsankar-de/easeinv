export enum ShippingZoneType {
  COUNTRY = "COUNTRY",
  STATE = "STATE",
  PINCODE = "PINCODE",
}

export enum ShippingRuleType {
  PRICE = "PRICE",
  WEIGHT = "WEIGHT",
}

export interface ShippingRuleDto {
  id: string;
  shippingProfileId: string | null;
  shippingZoneId: string | null;
  type: ShippingRuleType;
  minValue: number;
  maxValue: number | null;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingZoneDto {
  id: string;
  shippingProfileId: string;
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
  isActive: boolean;
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
  isActive: boolean;
  zoneCount: number;
  ruleCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingProfileCreateDto {
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface ShippingProfileUpdateDto {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface ShippingZoneCreateDto {
  name: string;
  type: ShippingZoneType;
  code: string;
}

export interface ShippingZoneUpdateDto {
  name?: string;
  type?: ShippingZoneType;
  code?: string;
}

export interface ShippingRuleCreateDto {
  shippingProfileId?: string | null;
  shippingZoneId?: string | null;
  type: ShippingRuleType;
  minValue?: number;
  maxValue?: number | null;
  amount: number;
}

export interface ShippingRuleUpdateDto {
  type?: ShippingRuleType;
  minValue?: number;
  maxValue?: number | null;
  amount?: number;
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
