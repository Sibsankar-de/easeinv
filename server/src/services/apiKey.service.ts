import { ApiKeyStatus } from "../types/model";
import { prisma } from "../lib/prisma";
import { generateSecureToken } from "../utils/token-generator";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { CreateUpdateApiKeyDTO } from "../schemas/apiKey.schema";
import { apiKeyLimits } from "../constants/limits.constants";

const generateApiKey = () => "sk_inv_" + generateSecureToken(256);

const enforceMaxApiKeysLimit = async (storeId: string) => {
  const apiKeyCount = await prisma.apiKey.count({ where: { storeId } });
  if (apiKeyCount >= apiKeyLimits.MAX_API_KEYS) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Maximum number of API keys reached.",
    );
  }
};

export const createApiKey = async (
  params: CreateUpdateApiKeyDTO & {
    storeId: string;
    userId: string;
  },
) => {
  const {
    storeId,
    userId,
    name,
    status,
    scopes,
    expiresAt,
    whitelistedOrigins,
    allowClientRequest,
  } = params;

  await enforceMaxApiKeysLimit(storeId);

  if (!name) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Name is required.");
  }

  if (
    allowClientRequest &&
    (!whitelistedOrigins || whitelistedOrigins.length === 0)
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Whitelisted origins are required when allowClientRequest is true.",
    );
  }

  if (expiresAt && expiresAt < new Date()) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Expiration date must be in the future.",
    );
  }

  const newKey = generateApiKey();

  const newApiKey = await prisma.apiKey.create({
    data: {
      key: newKey,
      storeId,
      userId,
      name,
      scopes: scopes ?? [],
      expiresAt: expiresAt ?? null,
      allowClientRequest: allowClientRequest ?? false,
      whitelistedOrigins: whitelistedOrigins ?? [],
      status: (status as ApiKeyStatus) ?? "ACTIVE",
    },
  });

  return newApiKey;
};

export const updateApiKey = async (
  params: CreateUpdateApiKeyDTO & {
    storeId: string;
    keyId: string;
  },
) => {
  const { storeId, keyId } = params;

  if (!keyId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Key id is required.");
  }

  const key = await prisma.apiKey.findFirst({ where: { id: keyId, storeId } });
  if (!key) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Api key not found.");
  }

  if (
    params.allowClientRequest &&
    (!params.whitelistedOrigins || params.whitelistedOrigins.length === 0)
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Whitelisted origins are required when allowClientRequest is true.",
    );
  }

  if (params.expiresAt && params.expiresAt < new Date()) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Expiration date must be in the future.",
    );
  }

  return prisma.apiKey.update({
    where: { id: keyId },
    data: {
      status: params.status as ApiKeyStatus,
      name: params.name,
      scopes: params.scopes ?? [],
      expiresAt: params.expiresAt ?? null,
      whitelistedOrigins: params.whitelistedOrigins ?? [],
      allowClientRequest: params.allowClientRequest ?? false,
    },
  });
};

export const removeApiKey = async (params: {
  storeId: string;
  keyId: string;
}) => {
  const { storeId, keyId } = params;

  if (!keyId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Key id is required.");
  }

  const key = await prisma.apiKey.findFirst({ where: { id: keyId, storeId } });
  if (!key) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Api key not found.");
  }

  await prisma.apiKey.delete({ where: { id: keyId } });
};

export const getAllApiKeys = async (storeId: string) => {
  return prisma.apiKey.findMany({
    where: { storeId },
    orderBy: { status: "asc" },
  });
};
