import { z } from "zod";

export const pricePerQuantityItemSchema = z.object({
  id: z.number().default(1),
  price: z.number().min(0, "Price must be non-negative"),
  quantity: z.number().min(0, "Quantity must be non-negative"),
  profitMargin: z.number().optional().default(0),
});

export const unitGroupSchema = z.object({
  id: z.number().default(1),
  name: z.string("Group name is required"),
  unit: z.string("Group unit is required."),
  multiplier: z.number("Unit multiplier must be a positive number."),
});

const categoryItemSchema = z.object({
  name: z.string().trim().min(1, "Category name cannot be empty"),
});

export const productCreateUpdateSchema = z
  .object({
    storeId: z.string().trim().min(1, "Store ID is required"),
    name: z.string().trim().min(1, "Product name is required"),
    sku: z.string().trim().min(1, "SKU is required"),
    gtin: z.string().trim().optional(),
    description: z.string().trim().optional(),
    buyingPricePerQuantity: z
      .number()
      .min(0, "Buying price must be non-negative"),
    trackInventory: z.boolean().optional().default(false),
    totalStock: z.number().optional().default(0),
    alertThreshold: z
      .number()
      .nonnegative("Alert threshold must be non-negative")
      .optional()
      .default(0),
    emailAlert: z.boolean().optional().default(false),
    stockUnit: z.string().trim().min(1, "Stock unit is required"),
    pricePerQuantity: z
      .array(pricePerQuantityItemSchema)
      .min(1, "Price per quantity is required"),
    unitGroups: z.array(unitGroupSchema).default([]).optional(),
    categoryIds: z.array(z.string()).default([]).optional(),
    imageIds: z.array(z.string()).default([]).optional(),
  })
  .refine(
    (data) => {
      if (
        data.trackInventory &&
        (data.totalStock === undefined || data.totalStock === null)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Total stock is required when inventory tracking is enabled",
      path: ["totalStock"],
    },
  );

export const rearrangeImagesSchema = z.object({
  imagePriorities: z.record(z.string(), z.number()),
});

export type PricePerQuantityDto = z.infer<typeof pricePerQuantityItemSchema>;
export type UnitGroupDto = z.infer<typeof unitGroupSchema>;
export type ProductCreateUpdateDTO = z.infer<typeof productCreateUpdateSchema>;
export type RearrangeImagesDTO = z.infer<typeof rearrangeImagesSchema>;
