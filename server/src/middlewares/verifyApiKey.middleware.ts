import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma";
import { ApiKeyStatus, StoreStatus } from "@prisma/client";
import { ApiKeyScope } from "../enums/apiKey.enum";

export const verifyApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers["authorization"];
    const apiKey =
      (authHeader && authHeader.split(" ")[1]) ||
      (req.headers["x-api-key"] as string);

    if (!apiKey) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "API key is missing");
    }

    // verify the API key
    const apikeyDoc = await prisma.apiKey.findUnique({
      where: {
        key: apiKey,
      },
      include: { store: true, user: true },
    });

    if (!apikeyDoc) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid API key");
    }

    if (apikeyDoc.status !== ApiKeyStatus.ACTIVE) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "API key is not active");
    }

    if (apikeyDoc.expiresAt && apikeyDoc.expiresAt < new Date()) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "API key has expired");
    }

    if (
      apikeyDoc.store.status === StoreStatus.DELETED ||
      apikeyDoc.store.status === StoreStatus.SUSPENDED
    ) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Store is suspended or inactive. Please contact customer support.",
      );
    }

    req.store = apikeyDoc.store;
    req.user = apikeyDoc.user;
    req.apiKey = apikeyDoc;

    next();
  } catch (error) {
    next(error);
  }
};

export const verifyApiKeyScope = (allowedScopes: (ApiKeyScope | string)[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const apiKey = req.apiKey;
      if (!apiKey) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "API key is required");
      }

      const keyScopes = apiKey.scopes || [];

      const hasAccess = keyScopes.some(
        (scope) =>
          scope === ApiKeyScope.ADMIN || allowedScopes.includes(scope),
      );

      if (!hasAccess) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          "Insufficient permissions: Missing required API key scope",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

