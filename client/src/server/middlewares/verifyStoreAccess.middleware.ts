import { MiddlewareContext } from "@/types/middleware";
import { NextRequest } from "next/server";
import { Store } from "../models/store.model";
import { ApiError } from "../utils/error-handler";
import { StatusCodes } from "http-status-codes";
import { StoreUser } from "../models/storeUser.model";

export const verifyStoreAccess = async (
  req: NextRequest,
  context: MiddlewareContext | undefined,
  params: Record<string, any> | undefined,
  allowed_roles: string[],
): Promise<MiddlewareContext> => {
  const { userId } = await context!;
  const { storeId } = await params!;

  const store = await Store.findById(storeId);
  if (!store) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Store not found.");
  }

  const storeUser = await StoreUser.findOne({ storeId, userId });
  if (!storeUser) {
    throw new ApiError(StatusCodes.FORBIDDEN, "User not linked with store.");
  }

  const hasAccess = allowed_roles.includes(storeUser.role);

  if (!hasAccess)
    throw new ApiError(StatusCodes.FORBIDDEN, "User has no access.");

  return { ...context, store };
};
