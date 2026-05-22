import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { StoreUser } from "../models/storeUser.model";
import { User } from "../models/user.model";
import { userRoles } from "../enums/store.enum";
import mongoose from "mongoose";

/**
 * Get all users for a specific store.
 */
export const getStoreUsers = asyncHandler(async (req: Request, res: Response) => {
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
});

/**
 * Add a registered user to the store by email.
 */
export const addStoreUser = asyncHandler(async (req: Request, res: Response) => {
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

  const newStoreUser = await StoreUser.create({
    storeId: storeId as string,
    userId: user._id,
    role,
  });

  const populated = await getPopulatedStoreUser((newStoreUser as any)._id);

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        populated,
        "User added to store successfully.",
      ),
    );
});

const getPopulatedStoreUser = async (storeUserId: any) => {
  const populated = await StoreUser.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(storeUserId),
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
      $lookup: {
        from: "stores",
        localField: "storeId",
        foreignField: "_id",
        as: "storeDetails",
      },
    },
    {
      $unwind: {
        path: "$storeDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        storeId: 1,
        userId: 1,
        role: 1,
        userName: "$userDetails.userName",
        email: "$userDetails.email",
        store: "$storeDetails",
      },
    },
  ]);

  return populated[0];
};

/**
 * Update a store user's role.
 */
export const updateStoreUserRole = asyncHandler(async (req: Request, res: Response) => {
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
});

/**
 * Remove a user from the store.
 */
export const removeStoreUser = asyncHandler(async (req: Request, res: Response) => {
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
});
