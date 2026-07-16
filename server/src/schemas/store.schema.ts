import { z } from "zod";
import { storeTypeList } from "../enums/store.enum";

export const createStoreSchema = z.object({
  name: z.string().trim().min(1, "Store name is required"),
  currencyCode: z.string().trim().min(1, "Currency code is required"),
  type: z.enum(storeTypeList),

  contactEmail: z.email("Invalid email").or(z.literal("")).optional(),
  contactNo: z.string().trim().optional(),

  addressLine: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  zipCode: z.string().trim().optional(),
  country: z.string().trim(),
});

export const updateStoreSchema = z.object({
  name: z.string().trim().min(1, "Store name is required"),
  currencyCode: z.string().trim().min(1, "Currency code is required"),
  type: z.enum(storeTypeList),
  contactEmail: z.email("Invalid email").or(z.literal("")).optional(),
  contactNo: z.string().trim().optional(),

  addressLine: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  zipCode: z.string().trim().optional(),
  country: z.string().trim(),
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
