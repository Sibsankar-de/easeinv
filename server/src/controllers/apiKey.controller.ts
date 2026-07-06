import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import * as apiKeyService from "../services/apiKey.service";
import { validateBody } from "../utils/validate.utils";
import { createApiKeySchema, renameApiKeySchema } from "../schemas/apiKey.schema";

export const createApiKey = asyncHandler(async (req, res) => {
  const storeId = req.store?._id;
  const userId = req.user?._id;

  const validatedBody = validateBody(createApiKeySchema, req.body);

  const newApiKey = await apiKeyService.createApiKey({
    storeId: storeId!,
    userId: userId!,
    ...validatedBody,
  });

  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, newApiKey, "Api key created."));
});

export const renameApiKey = asyncHandler(async (req, res) => {
  const storeId = req.store?._id;
  const { keyId } = req.params as { keyId: string };

  const validatedBody = validateBody(renameApiKeySchema, req.body);

  const key = await apiKeyService.renameApiKey({
    storeId: storeId!,
    keyId,
    ...validatedBody,
  });

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, key, "Api key renamed."));
});

export const revokeApiKey = asyncHandler(async (req, res) => {
  const storeId = req.store?._id;
  const { keyId } = req.params as { keyId: string };

  const key = await apiKeyService.revokeApiKey({
    storeId: storeId!,
    keyId,
  });

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, key, "Api key revoked."));
});

export const getAllApiKeys = asyncHandler(async (req, res) => {
  const storeId = req.store?._id;

  const apiKeys = await apiKeyService.getAllApiKeys(storeId!);

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, apiKeys, "Api keys fetched."));
});
