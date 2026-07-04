import mongoose from "mongoose";
import { StoreUser } from "../models/storeUser.model";
import { User } from "../models/user.model";
import { Store } from "../models/store.model";
import { StoreUserInvite } from "../models/storeUserInvite.model";
import { userRoles } from "../enums/store.enum";
import { generateSecureToken } from "../utils/token-generator";
import { clientPages } from "../constants/client.constant";
import { publishEmailJob } from "./emailPublisher.service";
import { getStoreUserInviteEmail } from "./email.service";
import { addDays } from "../utils/date-utils";
import { dateConstants } from "../constants/date.constants";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import {
  InviteStoreUserDTO,
  UpdateStoreUserRoleDTO,
} from "../schemas/storeAccess.schema";

export const getStoreUsers = async (storeId: string) => {
  const accessorsList = await StoreUser.aggregate([
    {
      $match: {
        storeId: new mongoose.Types.ObjectId(storeId),
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

  return accessorsList;
};

export const inviteStoreUser = async (
  params: InviteStoreUserDTO & {
    store: any;
    storeId: string;
  },
) => {
  const { store, storeId, email, role } = params;

  if (!email || !role) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Email and role are required.");
  }

  if (!Object.values(userRoles).includes(role as any)) {
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

  const invitationToken = generateSecureToken(256);
  const invitationLink = clientPages.getStoreInvitePage(invitationToken);

  const expiresAt = addDays(
    new Date(),
    dateConstants.STORE_USER_INVITE_EXPIRY_DAYS,
  );

  await StoreUserInvite.create({
    storeId,
    email,
    role,
    token: invitationToken,
    expiresAt,
  });

  publishEmailJob(
    await getStoreUserInviteEmail(user, store, role, invitationLink),
  );

  return null;
};

export const getStoreUserInvite = async (token: string, user: any) => {
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

  return inviteDetails;
};

export const acceptStoreUserInvite = async (token: string, user: any) => {
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

  await invite.deleteOne();

  return { storeId: invite.storeId };
};

export const updateStoreUserRole = async (
  params: UpdateStoreUserRoleDTO & {
    storeId: string;
    targetUserId: string;
  },
) => {
  const { storeId, targetUserId, role } = params;

  if (!role) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Role is required.");
  }

  if (!Object.values(userRoles).includes(role as any)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid role.");
  }

  const storeUser = await StoreUser.findOne({
    storeId,
    userId: targetUserId,
  });
  if (!storeUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Store user not found.");
  }

  if (storeUser.role === userRoles.OWNER) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Cannot change the OWNER's role.",
    );
  }

  storeUser.role = role as any;
  await storeUser.save();

  return storeUser;
};

export const removeStoreUser = async (
  storeId: string,
  targetUserId: string,
) => {
  const storeUser = await StoreUser.findOne({
    storeId,
    userId: targetUserId,
  });
  if (!storeUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Store user not found.");
  }

  if (storeUser.role === userRoles.OWNER) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Cannot remove the OWNER from the store.",
    );
  }

  await StoreUser.findByIdAndDelete(storeUser._id);

  return { userId: targetUserId };
};
