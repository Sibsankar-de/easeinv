import { ApiKeyScope } from "@/constants/apiKeyConstants";

export type ApiKeyDto = {
  id: string;
  key: string;
  storeId: string;
  userId: string;
  name: string;
  scopes: ApiKeyScope[];
  whitelistedOrigins: string[];
  allowClientRequest: boolean;
  status: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};
