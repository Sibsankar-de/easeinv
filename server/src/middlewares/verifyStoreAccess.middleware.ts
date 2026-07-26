import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import {
  EmployeeLevelRoles,
  ManagerLevelRoles,
  OwnerLevelRoles,
} from "../constants/userStoreRoles";
import { StoreStatus, User } from "@prisma/client";

export const verifyStoreAccess = (allowed_roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const storeId = req.params.storeId as string;
      const user = req.user;
      const userId = user?.id;

      if (!user || !user.isEmailVerified) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          "Email verification is required.",
        );
      }

      if (!storeId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Store ID is required");
      }

      const store = await prisma.store.findUnique({
        where: { id: storeId, status: { not: StoreStatus.DELETED } },
      });
      if (!store) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Store not found");
      }

      if (store.status === StoreStatus.SUSPENDED) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Store suspended. Contact to customer service.",
        );
      }

      const storeUser = await prisma.storeUser.findFirst({
        where: { storeId, userId },
      });
      if (!storeUser) {
        throw new ApiError(StatusCodes.FORBIDDEN, "User not linked with store");
      }

      const hasAccess = allowed_roles.includes(storeUser.role);
      if (!hasAccess) {
        throw new ApiError(StatusCodes.FORBIDDEN, "User has no access");
      }

      req.store = store;
      req.storeUserRole = storeUser.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const verifyOwnerLevelAccess = verifyStoreAccess(OwnerLevelRoles);
export const verifyManagerLevelAccess = verifyStoreAccess(ManagerLevelRoles);
export const verifyEmployeeLevelAccess = verifyStoreAccess(EmployeeLevelRoles);
