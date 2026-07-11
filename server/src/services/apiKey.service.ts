import mongoose from "mongoose";
import { ApiKey } from "../models/apiKey.model";
import { generateSecureToken } from "../utils/token-generator";
import { apiKeyStatus } from "../enums/apiKey.enum";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { CreateUpdateApiKeyDTO } from "../schemas/apiKey.schema";
import { apiKeyLimits } from "../constants/limits.constants";

const generateApiKey = () => {
  return "sk_inv_" + generateSecureToken(256);
};

export const createApiKey = async (
  params: CreateUpdateApiKeyDTO & {
    storeId: string | mongoose.Types.ObjectId;
    userId: string | mongoose.Types.ObjectId;
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

  enforceMaxApiKeysLimit(storeId);

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

  const newApiKey = await ApiKey.create({
    key: newKey,
    storeId,
    userId,
    name,
    scopes,
    expiresAt,
    allowClientRequest,
    whitelistedOrigins,
    status,
  });

  if (!newApiKey) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to create Api key",
    );
  }

  return newApiKey;
};

const enforceMaxApiKeysLimit = async (
  storeId: string | mongoose.Types.ObjectId,
) => {
  const apiKeyCount = await ApiKey.countDocuments({ storeId });
  if (apiKeyCount >= apiKeyLimits.MAX_API_KEYS) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Maximum number of API keys reached.",
    );
  }
};

export const updateApiKey = async (
  params: CreateUpdateApiKeyDTO & {
    storeId: string | mongoose.Types.ObjectId;
    keyId: string;
  },
) => {
  const { storeId, keyId } = params;

  if (!keyId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Key id is required.");
  }

  const key = await ApiKey.findOne({ _id: keyId, storeId });
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

  key.status = params.status;
  key.name = params.name;
  key.scopes = params.scopes;
  key.expiresAt = params.expiresAt;
  key.whitelistedOrigins = params.whitelistedOrigins;
  key.allowClientRequest = params.allowClientRequest;

  await key.save({ validateBeforeSave: false });

  return key;
};

export const removeApiKey = async (params: {
  storeId: string | mongoose.Types.ObjectId;
  keyId: string;
}) => {
  const { storeId, keyId } = params;

  if (!keyId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Key id is required.");
  }

  const key = await ApiKey.findOne({ _id: keyId, storeId });
  if (!key) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Api key not found.");
  }

  await key.deleteOne();
};

export const getAllApiKeys = async (
  storeId: string | mongoose.Types.ObjectId,
) => {
  const apiKeys = await ApiKey.find({ storeId }).sort({ status: 1 });
  return apiKeys;
};
