import { z } from "zod";

export const createApiKeySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  scopes: z.array(z.string()).optional(),
  expiresAt: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .optional(),
});

export const renameApiKeySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export type CreateApiKeyDTO = z.infer<typeof createApiKeySchema>;
export type RenameApiKeyDTO = z.infer<typeof renameApiKeySchema>;
