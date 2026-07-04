import mongoose from "mongoose";
import { ApiKey } from "../models/apiKey.model";
import { generateSecureToken } from "../utils/token-generator";
import { apiKeyStatus } from "../enums/apiKey.enum";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { CreateApiKeyDTO, RenameApiKeyDTO } from "../schemas/apiKey.schema";

const generateApiKey = () => {
  return "sk_inv_" + generateSecureToken(256);
};

export const createApiKey = async (
  params: CreateApiKeyDTO & {
    storeId: string | mongoose.Types.ObjectId;
    userId: string | mongoose.Types.ObjectId;
  },
) => {
  const { storeId, userId, name, scopes, expiresAt } = params;

  if (!name) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Name is required.");
  }

  const newKey = generateApiKey();

  const newApiKey = await ApiKey.create({
    key: newKey,
    storeId,
    userId,
    name,
    scopes,
    expiresAt,
    status: apiKeyStatus.ACTIVE,
  });

  if (!newApiKey) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to create Api key",
    );
  }

  return newApiKey;
};

export const renameApiKey = async (
  params: RenameApiKeyDTO & {
    storeId: string | mongoose.Types.ObjectId;
    keyId: string;
  },
) => {
  const { storeId, keyId, name } = params;

  if (!keyId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Key id is required.");
  }

  if (!name) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Name is required.");
  }

  const key = await ApiKey.findOne({ _id: keyId, storeId });
  if (!key) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Api key not found.");
  }

  key.name = name;
  await key.save({ validateBeforeSave: false });

  return key;
};

export const revokeApiKey = async (params: {
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

  key.status = apiKeyStatus.REVOKED;
  await key.save({ validateBeforeSave: false });

  return key;
};

export const getAllApiKeys = async (
  storeId: string | mongoose.Types.ObjectId,
) => {
  const apiKeys = await ApiKey.find({ storeId }).sort({ status: 1 });
  return apiKeys;
};
