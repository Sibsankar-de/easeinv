import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { StoreUser } from "../models/storeUser.model";
import { User } from "../models/user.model";
import { userRoles } from "../enums/store.enum";
import mongoose from "mongoose";
import { generateSecureToken } from "../utils/token-generator";
import { clientPages } from "../constants/client.constant";
import { publishEmailJob } from "../services/emailPublisher.service";
import { getStoreUserInviteEmail } from "./email.controller";
import { StoreUserInvite } from "../models/storeUserInvite.model";
import { addDays } from "../utils/date-utils";
import { dateConstants } from "../constants/date.constants";
import { Store } from "../models/store.model";

/**
 * Get all users for a specific store.
 */
export const getStoreUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;

    const accessorsList = await StoreUser.aggregate([
      {
        $match: {
          storeId: new mongoose.Types.ObjectId(storeId as string),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          _id: 0,
          storeId: 1,
          userId: 1,
          role: 1,
          userName: "$userDetails.userName",
          email: "$userDetails.email",
        },
      },
    ]);

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
    const { storeId } = req.params;
    const { email, role } = req.body;

    if (!email || !role) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Email and role are required.",
      );
    }

    if (!Object.values(userRoles).includes(role)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid role.");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "User not found. They must be registered first.",
      );
    }

    const existingStoreUser = await StoreUser.findOne({
      storeId,
      userId: user._id,
    });
    if (existingStoreUser) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "User is already added to this store.",
      );
    }

    // find existed invitation
    const existingInvite = await StoreUserInvite.findOne({
      storeId,
      email,
    });

    if (existingInvite) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "An invitation has already been sent to this email for this store.",
      );
    }

    // send invitation email
    const invitationToken = generateSecureToken(256);
    const invitationLink = clientPages.getStoreInvitePage(invitationToken);

    const expiresAt = addDays(
      new Date(),
      dateConstants.STORE_USER_INVITE_EXPIRY_DAYS,
    );
    await StoreUserInvite.create({
      storeId: storeId as string,
      email,
      role,
      token: invitationToken,
      expiresAt,
    });

    publishEmailJob(
      await getStoreUserInviteEmail(user, store, role, invitationLink),
    );

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
    const { token } = req.params;
    const user = req.user!;

    if (!token || typeof token !== "string") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Invitation token is required.",
      );
    }

    const invite = await StoreUserInvite.findOne({ email: user.email, token });
    if (!invite || invite.isExpired()) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Invalid or expired invitation token.",
      );
    }

    const store = await Store.findById(invite.storeId);

    const inviteDetails = {
      storeId: invite.storeId,
      storeName: store ? store.name : "Unknown Store",
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
    };

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

    if (!token || typeof token !== "string") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Invitation token is required.",
      );
    }

    const invite = await StoreUserInvite.findOne({ token, email: user.email });
    if (!invite || invite.isExpired()) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Invalid or expired invitation token.",
      );
    }

    await StoreUser.create({
      storeId: invite.storeId,
      userId: user._id,
      role: invite.role,
    });

    // delete the invite after accepting
    await invite.deleteOne();

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          { storeId: invite.storeId },
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
    const { storeId, userId: targetUserId } = req.params;
    const { role } = req.body;

    if (!role) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Role is required.");
    }

    if (!Object.values(userRoles).includes(role)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid role.");
    }

    const storeUser = await StoreUser.findOne({
      storeId,
      userId: targetUserId,
    });
    if (!storeUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Store user not found.");
    }

    // Prevent changing OWNER role
    if (storeUser.role === userRoles.OWNER) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Cannot change the OWNER's role.",
      );
    }

    storeUser.role = role;
    await storeUser.save();

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
    const { storeId, userId: targetUserId } = req.params;

    const storeUser = await StoreUser.findOne({
      storeId,
      userId: targetUserId,
    });
    if (!storeUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Store user not found.");
    }

    // Prevent removing the OWNER
    if (storeUser.role === userRoles.OWNER) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Cannot remove the OWNER from the store.",
      );
    }

    await StoreUser.findByIdAndDelete(storeUser._id);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          { userId: targetUserId },
          "User removed from store successfully.",
        ),
      );
  },
);
