import { z } from "zod";
import { apiKeyLimits } from "../constants/limits.constants";
import { apiKeyScopeList, ApiKeyStatus } from "../enums/apiKey.enum";

export const createUpdateApiKeySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  status: z
    .enum([ApiKeyStatus.ACTIVE, ApiKeyStatus.INACTIVE])
    .default(ApiKeyStatus.ACTIVE),
  scopes: z.array(z.enum(apiKeyScopeList)).default([]),
  allowClientRequest: z.boolean().default(false),
  whitelistedOrigins: z
    .array(z.url({ normalize: true, message: "Invalid Origin" }))
    .max(
      apiKeyLimits.MAX_WHITELISTED_ORIGINS,
      `Maximum ${apiKeyLimits.MAX_WHITELISTED_ORIGINS} whitelisted origins are allowed`,
    )
    .default([]),
  expiresAt: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
});

export type CreateUpdateApiKeyDTO = z.infer<typeof createUpdateApiKeySchema>;
