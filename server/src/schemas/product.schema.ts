import { z } from "zod";

const pricePerQuantityItemSchema = z.object({
  id: z.number().default(1),
  price: z.number().min(0, "Price must be non-negative"),
  quantity: z.number().min(0, "Quantity must be non-negative"),
  profitMargin: z.number().optional().default(0),
});

const categoryItemSchema = z.object({
  name: z.string().trim().min(1, "Category name cannot be empty"),
});

export const createProductSchema = z
  .object({
    storeId: z.string().trim().min(1, "Store ID is required"),
    name: z.string().trim().min(1, "Product name is required"),
    sku: z.string().trim().min(1, "SKU is required"),
    gtin: z.string().trim().optional(),
    description: z.string().trim().optional(),
    buyingPricePerQuantity: z
      .number()
      .min(0, "Buying price must be non-negative"),
    enableInventoryTracking: z.boolean().optional().default(false),
    totalStock: z.number().optional(),
    stockUnit: z.string().trim().min(1, "Stock unit is required"),
    pricePerQuantity: z
      .array(pricePerQuantityItemSchema)
      .min(1, "Price per quantity is required"),
    categories: z.array(categoryItemSchema).optional(),
    imageIds: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (
        data.enableInventoryTracking &&
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

export const updateProductSchema = z
  .object({
    storeId: z.string().trim().min(1, "Store ID is required"),
    name: z.string().trim().min(1, "Product name is required"),
    sku: z.string().trim().min(1, "SKU is required"),
    gtin: z.string().trim().optional(),
    description: z.string().trim().optional(),
    buyingPricePerQuantity: z
      .number()
      .min(0, "Buying price must be non-negative"),
    enableInventoryTracking: z.boolean().optional().default(false),
    totalStock: z.number().optional(),
    stockUnit: z.string().trim().min(1, "Stock unit is required"),
    pricePerQuantity: z
      .array(pricePerQuantityItemSchema)
      .min(1, "Price per quantity is required"),
    categories: z.array(categoryItemSchema).optional(),
    imageIds: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (
        data.enableInventoryTracking &&
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

export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
export type RearrangeImagesDTO = z.infer<typeof rearrangeImagesSchema>;
