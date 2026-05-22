import { Request, Response, NextFunction } from "express";
import { Store } from "../models/store.model";
import { StoreUser } from "../models/storeUser.model";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";

export const verifyStoreAccess = (allowed_roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { storeId } = req.params;
      const userId = req.user?._id;

      if (!storeId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Store ID is required");
      }

      const store = await Store.findById(storeId);
      if (!store) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Store not found");
      }

      const storeUser = await StoreUser.findOne({ storeId, userId });
      if (!storeUser) {
        throw new ApiError(StatusCodes.FORBIDDEN, "User not linked with store");
      }

      const hasAccess = allowed_roles.includes(storeUser.role);
      if (!hasAccess) {
        throw new ApiError(StatusCodes.FORBIDDEN, "User has no access");
      }

      req.store = store;
      next();
    } catch (error) {
      next(error);
    }
  };
};
