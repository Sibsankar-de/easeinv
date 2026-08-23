import { DiscountType } from "@prisma/client";
import { z } from "zod";

export const couponCreateUpdateSchema = z
  .object({
    name: z.string().trim().min(1, "Coupon name is required"),
    code: z
      .string()
      .trim()
      .min(1, "Coupon code is required")
      .transform((val) => val.toUpperCase()),
    description: z.string().trim().optional().nullable(),
    discountType: z.enum(DiscountType),
    discountValue: z.number().positive("Discount value must be greater than 0"),
    maxDiscount: z
      .number()
      .nonnegative("Max discount must be non-negative")
      .optional()
      .nullable(),
    minOrderValue: z
      .number()
      .nonnegative("Minimum order value must be non-negative")
      .optional()
      .nullable(),
    usageLimit: z
      .number()
      .int()
      .positive("Usage limit must be a positive integer")
      .optional()
      .nullable(),
    perCustomerLimit: z
      .number()
      .int()
      .positive("Per customer limit must be a positive integer")
      .optional()
      .nullable(),
    isActive: z.boolean().optional().default(true),
    startsAt: z.coerce.date().optional().nullable(),
    endsAt: z.coerce.date().optional().nullable(),
    categoryIds: z
      .array(z.uuid("Invalid category ID format"))
      .optional()
      .default([]),
    useAllCategories: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      if (data.discountType === "PERCENT" && data.discountValue > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["discountValue"],
    },
  )
  .refine(
    (data) => {
      if (data.startsAt && data.endsAt && data.endsAt < data.startsAt) {
        return false;
      }
      return true;
    },
    {
      message: "End date must be after or equal to start date",
      path: ["endsAt"],
    },
  );

export const couponFilterQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  query: z.string().optional().default(""),
  isActive: z.preprocess((val) => {
    if (val === "true" || val === true) return true;
    if (val === "false" || val === false) return false;
    return undefined;
  }, z.boolean().optional()),
  discountType: z.enum(DiscountType).optional(),
  categoryId: z.uuid("Invalid category ID format").optional(),
  sortBy: z
    .enum([
      "createdAt",
      "updatedAt",
      "name",
      "code",
      "discountValue",
      "startsAt",
      "endsAt",
      "usageCount",
    ])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CouponFilterQueryDTO = z.infer<typeof couponFilterQuerySchema>;
export type CouponCreateUpdateDTO = z.infer<typeof couponCreateUpdateSchema>;
