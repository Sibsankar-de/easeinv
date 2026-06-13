import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiKey } from "../models/apiKey.model";
import { generateSecureToken } from "../utils/token-generator";
import { ApiResponse } from "../utils/ApiResponse";
import { apiKeyStatus } from "../enums/apiKey.enum";

const generateApiKey = () => {
  return "sk_inv_" + generateSecureToken(256);
};

export const createApiKey = asyncHandler(async (req, res) => {
  const storeId = req.store?._id;
  const userId = req.user?._id;

  const { name, scopes, expiresAt } = req.body;
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

  return res
    .status(200)
    .json(new ApiResponse(StatusCodes.CREATED, newApiKey, "Api key created."));
});

export const renameApiKey = asyncHandler(async (req, res) => {
  const storeId = req.store?._id;
  const { keyId } = req.params;
  const { name } = req.body;

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

  return res
    .status(200)
    .json(new ApiResponse(StatusCodes.OK, key, "Api key renamed."));
});

export const revokeApiKey = asyncHandler(async (req, res) => {
  const storeId = req.store?._id;
  const { keyId } = req.params;

  if (!keyId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Key id is required.");
  }

  const key = await ApiKey.findOne({ _id: keyId, storeId });
  if (!key) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Api key not found.");
  }

  key.status = apiKeyStatus.REVOKED;
  await key.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(StatusCodes.OK, key, "Api key revoked."));
});

export const getAllApiKeys = asyncHandler(async (req, res) => {
  const storeId = req.store?._id;

  const apiKeys = await ApiKey.find({ storeId });

  return res
    .status(200)
    .json(new ApiResponse(StatusCodes.OK, apiKeys, "Api keys fetched."));
});
