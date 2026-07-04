import { z } from "zod";

export const createStoreSchema = z.object({
  name: z.string().trim().min(1, "Store name is required"),
  currencyCode: z.string().trim().min(1, "Currency code is required"),
  businessType: z.string().trim().optional(),
  address: z.string().trim().optional(),
  contactEmail: z.email("Invalid email").or(z.literal("")).optional(),
  contactNo: z.string().trim().optional(),
});

export const updateStoreSchema = z.object({
  name: z.string().trim().min(1, "Store name is required"),
  currencyCode: z.string().trim().min(1, "Currency code is required"),
  businessType: z.string().trim().optional(),
  address: z.string().trim().optional(),
  contactEmail: z.email("Invalid email").or(z.literal("")).optional(),
  contactNo: z.string().trim().optional(),
});

export const updateStoreSettingsSchema = z
  .object({
    invoiceStoreName: z.string().trim().optional(),
    invoiceStoreAddress: z.string().trim().optional(),
    invoiceStoreContactNo: z.string().trim().optional(),
    invoiceStoreEmail: z.email("Invalid email").or(z.literal("")).optional(),
    invoicePaymentQrCode: z.string().trim().optional(),
    invoiceStoreLogoUrl: z.string().trim().optional(),
    enableInventoryTracking: z.boolean().optional(),
    termsAndConditions: z.string().trim().optional(),
  })
  .loose();

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required"),
});

export type CreateStoreDTO = z.infer<typeof createStoreSchema>;
export type UpdateStoreDTO = z.infer<typeof updateStoreSchema>;
export type UpdateStoreSettingsDTO = z.infer<typeof updateStoreSettingsSchema>;
export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
