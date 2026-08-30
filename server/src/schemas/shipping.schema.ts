import { ShippingRuleType, ShippingZoneType } from "@prisma/client";
import { z } from "zod";

export const shippingRuleCreateUpdateSchema = z
  .object({
    shippingProfileId: z.string().uuid("Invalid shipping profile ID").optional().nullable(),
    shippingZoneId: z.string().uuid("Invalid shipping zone ID").optional().nullable(),
    type: z.enum(ShippingRuleType),
    minValue: z.number().nonnegative("Minimum value must be non-negative").default(0),
    maxValue: z.number().positive("Maximum value must be positive").optional().nullable(),
    amount: z.number().nonnegative("Amount must be non-negative"),
  })
  .refine(
    (data) => !(data.shippingProfileId && data.shippingZoneId),
    {
      message: "Rule cannot belong to both a profile and a zone simultaneously",
      path: ["shippingProfileId"],
    },
  )
  .refine(
    (data) => {
      if (data.maxValue !== null && data.maxValue !== undefined && data.maxValue < data.minValue) {
        return false;
      }
      return true;
    },
    {
      message: "Max value must be greater than or equal to min value",
      path: ["maxValue"],
    },
  );

export const shippingZoneCreateUpdateSchema = z.object({
  name: z.string().trim().min(1, "Zone name is required"),
  type: z.enum(ShippingZoneType),
  code: z.string().trim().min(1, "Zone code is required"),
});

export const shippingProfileCreateUpdateSchema = z.object({
  name: z.string().trim().min(1, "Profile name is required"),
  description: z.string().trim().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

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
  items: z
    .array(
      z.object({
        productId: z.string().uuid("Product ID must be a valid UUID"),
        netQuantity: z
          .number()
          .positive("Net quantity must be greater than zero"),
      }),
    )
    .min(1, "At least one item is required to calculate shipping"),
});

export type ShippingRuleCreateUpdateDto = z.infer<typeof shippingRuleCreateUpdateSchema>;
export type ShippingZoneCreateUpdateDto = z.infer<typeof shippingZoneCreateUpdateSchema>;
export type ShippingProfileCreateUpdateDto = z.infer<typeof shippingProfileCreateUpdateSchema>;
export type ShippingProfileQueryDto = z.infer<typeof shippingProfileQuerySchema>;
export type ShippingAddressDto = z.infer<typeof shippingAddressSchema>;
export type CalculateShippingDto = z.infer<typeof calculateShippingSchema>;

