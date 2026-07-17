import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { StatusCodes } from "http-status-codes";
import * as storeAccessService from "../services/storeAccess.service";
import { validateBody } from "../utils/validate.utils";
import {
  inviteStoreUserSchema,
  updateStoreUserRoleSchema,
} from "../schemas/storeAccess.schema";

/**
 * Get all users for a specific store.
 */
export const getStoreUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };

    const accessorsList = await storeAccessService.getStoreUsers(storeId);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          accessorsList,
          "Store users fetched successfully.",
        ),
      );
  },
);

/**
 * Add a registered user to the store by email.
 */
export const inviteStoreUser = asyncHandler(
  async (req: Request, res: Response) => {
    const store = req.store!;
    const { storeId } = req.params as { storeId: string };

    const validatedBody = validateBody(inviteStoreUserSchema, req.body);

    await storeAccessService.inviteStoreUser({
      store,
      storeId,
      ...validatedBody,
    });

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          null,
          "Invitation created successfully.",
        ),
      );
  },
);

export const getStoreUserInvite = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.params as { token: string };
    const user = req.user!;

    const inviteDetails = await storeAccessService.getStoreUserInvite(
      token,
      user,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          inviteDetails,
          "Invitation details fetched successfully.",
        ),
      );
  },
);

export const acceptStoreUserInvite = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.query;
    const user = req.user!;

    const result = await storeAccessService.acceptStoreUserInvite(
      token as string,
      user,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          result,
          "Invitation accepted. You have been added to the store.",
        ),
      );
  },
);

/**
 * Update a store user's role.
 */
export const updateStoreUserRole = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, userId: targetUserId } = req.params as {
      storeId: string;
      userId: string;
    };

    const validatedBody = validateBody(updateStoreUserRoleSchema, req.body);

    const storeUser = await storeAccessService.updateStoreUserRole({
      storeId,
      targetUserId,
      ...validatedBody,
    });

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          storeUser,
          "User role updated successfully.",
        ),
      );
  },
);

/**
 * Remove a user from the store.
 */
export const removeStoreUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, userId: targetUserId } = req.params as {
      storeId: string;
      userId: string;
    };

    const result = await storeAccessService.removeStoreUser(
      storeId,
      targetUserId,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          result,
          "User removed from store successfully.",
        ),
      );
  },
);
