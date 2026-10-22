import { ShippingRuleType, ShippingZoneType } from "@prisma/client";
import { z } from "zod";

export const shippingProfileCreateUpdateSchema = z.object({
  name: z.string().trim().min(1, "Profile name is required"),
  description: z.string().trim().optional().nullable(),
  isDefault: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  fallbackRate: z.number().nonnegative("Fallback rate must be non-negative").optional().default(0),
});

export const shippingZoneCreateUpdateSchema = z.object({
  name: z.string().trim().min(1, "Zone name is required"),
  type: z.enum(ShippingZoneType),
  code: z.string().trim().min(1, "Zone code is required"),
});

export const shippingRuleCreateUpdateSchema = z
  .object({
    profileId: z.string().uuid("Invalid shipping profile ID").optional().nullable(),
    zoneId: z.string().uuid("Invalid shipping zone ID").optional().nullable(),
    name: z.string().trim().min(1, "Rule name is required"),
    type: z.enum(ShippingRuleType).default("FLAT"),
    rate: z.number().nonnegative("Rate must be non-negative"),
    minValue: z.number().nonnegative("Minimum value must be non-negative").optional().nullable(),
    maxValue: z.number().positive("Maximum value must be positive").optional().nullable(),
  })
  .refine(
    (data) => !(data.profileId && data.zoneId),
    {
      message: "Rule cannot belong to both a profile and a zone simultaneously",
      path: ["profileId"],
    },
  )
  .refine(
    (data) => {
      if (
        data.maxValue != null &&
        data.minValue != null &&
        data.maxValue < data.minValue
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Max value must be greater than or equal to min value",
      path: ["maxValue"],
    },
  );

export const shippingProfileQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  query: z.string().optional().default(""),
  isActive: z.preprocess((val) => {
    if (val === "true" || val === true) return true;
    if (val === "false" || val === false) return false;
    return undefined;
  }, z.boolean().optional()),
  sortBy: z.enum(["createdAt", "updatedAt", "name"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const shippingAddressSchema = z.object({
  addressLine: z.string().trim().min(1, "Address line is required"),
  city: z.string().trim().optional().default(""),
  state: z.string().trim().optional().default(""),
  pincode: z.string().trim().optional().default(""),
  country: z.string().trim().min(1, "Country is required"),
});

export const calculateShippingSchema = z.object({
  shippingAddress: shippingAddressSchema,
  subtotal: z.number().nonnegative("Subtotal must be non-negative"),
});

export type ShippingProfileCreateUpdateDto = z.infer<typeof shippingProfileCreateUpdateSchema>;
export type ShippingZoneCreateUpdateDto = z.infer<typeof shippingZoneCreateUpdateSchema>;
export type ShippingRuleCreateUpdateDto = z.infer<typeof shippingRuleCreateUpdateSchema>;
export type ShippingProfileQueryDto = z.infer<typeof shippingProfileQuerySchema>;
export type ShippingAddressDto = z.infer<typeof shippingAddressSchema>;
export type CalculateShippingDto = z.infer<typeof calculateShippingSchema>;
