import z from "zod";

export const analyticsQuerySchema = z.object({
  period: z.enum(["daily", "weekly", "monthly"]).optional().default("daily"),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be in YYYY-MM-DD format")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "endDate must be in YYYY-MM-DD format")
    .optional(),
});

export type AnalyticsQuerySchemaDTO = z.infer<typeof analyticsQuerySchema>;

export const productAnalyticsQuerySchema = analyticsQuerySchema.extend({
  productId: z.uuid("productId must be a valid UUID").optional(),
  categoryId: z.uuid("categoryId must be a valid UUID").optional(),
  limit: z.coerce.number().int().positive().optional().default(10),
  productCount: z.coerce.number().int().positive().optional(),
});

export type ProductAnalyticsQuerySchemaDTO = z.infer<
  typeof productAnalyticsQuerySchema
>;

export const customerAnalyticsQuerySchema = analyticsQuerySchema.extend({
  customerId: z.uuid("customerId must be a valid UUID").optional(),
  limit: z.coerce.number().int().positive().optional().default(10),
  customerCount: z.coerce.number().int().positive().optional(),
});

export type CustomerAnalyticsQuerySchemaDTO = z.infer<
  typeof customerAnalyticsQuerySchema
>;

export const categoryAnalyticsQuerySchema = analyticsQuerySchema.extend({
  categoryId: z.uuid("categoryId must be a valid UUID").optional(),
  limit: z.coerce.number().int().positive().optional().default(10),
  categoryCount: z.coerce.number().int().positive().optional(),
});

export type CategoryAnalyticsQuerySchemaDTO = z.infer<
  typeof categoryAnalyticsQuerySchema
>;
