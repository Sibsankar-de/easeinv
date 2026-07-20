import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponseHandler";
import * as apiKeyService from "../services/apiKey.service";
import { validateBody } from "../utils/validate.utils";
import { createUpdateApiKeySchema } from "../schemas/apiKey.schema";

export const createApiKey = asyncHandler(async (req, res) => {
  const storeId = req.store?.id;
  const userId = req.user?.id;

  const validatedBody = validateBody(createUpdateApiKeySchema, req.body);

  const newApiKey = await apiKeyService.createApiKey({
    storeId: storeId!,
    userId: userId!,
    ...validatedBody,
  });

  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, newApiKey, "Api key created."));
});

export const updateApiKey = asyncHandler(async (req, res) => {
  const storeId = req.store?.id;
  const { keyId } = req.params as { keyId: string };

  const validatedBody = validateBody(createUpdateApiKeySchema, req.body);

  const key = await apiKeyService.updateApiKey({
    storeId: storeId!,
    keyId,
    ...validatedBody,
  });

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, key, "Api key renamed."));
});

export const removeApiKey = asyncHandler(async (req, res) => {
  const storeId = req.store?.id;
  const { keyId } = req.params as { keyId: string };

  await apiKeyService.removeApiKey({
    storeId: storeId!,
    keyId,
  });

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, null, "Api key removed."));
});

export const getAllApiKeys = asyncHandler(async (req, res) => {
  const storeId = req.store?.id;

  const apiKeys = await apiKeyService.getAllApiKeys(storeId!);

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, apiKeys, "Api keys fetched."));
});
