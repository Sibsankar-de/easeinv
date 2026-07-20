import { prisma } from "../lib/prisma";
import { generateSecureToken } from "../utils/token-generator";
import { clientPages } from "../constants/client.constant";
import { publishEmailJob } from "./emailPublisher.service";
import { getStoreUserInviteEmail } from "./email.service";
import { addDays } from "../utils/date-utils";
import { dateConstants } from "../constants/date.constants";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import {
  InviteStoreUserDTO,
  UpdateStoreUserRoleDTO,
} from "../schemas/storeAccess.schema";
import { Store } from "@prisma/client";

export const getStoreUsers = async (storeId: string) => {
  const storeUsers = await prisma.storeUser.findMany({
    where: { storeId },
    include: {
      user: {
        select: { id: true, userName: true, email: true },
      },
    },
  });

  return storeUsers.map((su) => ({
    storeId: su.storeId,
    userId: su.userId,
    role: su.role,
    userName: su.user.userName,
    email: su.user.email,
  }));
};

export const inviteStoreUser = async (
  params: InviteStoreUserDTO & {
    store: Store;
    storeId: string;
  },
) => {
  const { store, storeId, email, role } = params;

  if (!email || !role) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Email and role are required.");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "User not found. They must be registered first.",
    );
  }

  const existingStoreUser = await prisma.storeUser.findFirst({
    where: { storeId, userId: user.id },
  });
  if (existingStoreUser) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "User is already added to this store.",
    );
  }

  const existingInvite = await prisma.storeUserInvite.findFirst({
    where: { storeId, email },
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

  await prisma.storeUserInvite.create({
    data: {
      storeId,
      email,
      role: role as any,
      token: invitationToken,
      expiresAt,
    },
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

  const invite = await prisma.storeUserInvite.findFirst({
    where: { email: user.email, token },
  });
  if (!invite || new Date() > invite.expiresAt) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Invalid or expired invitation token.",
    );
  }

  const store = await prisma.store.findUnique({
    where: { id: invite.storeId },
  });

  return {
    storeId: invite.storeId,
    storeName: store ? store.name : "Unknown Store",
    email: invite.email,
    role: invite.role,
    expiresAt: invite.expiresAt,
  };
};

export const acceptStoreUserInvite = async (token: string, user: any) => {
  if (!token || typeof token !== "string") {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Invitation token is required.",
    );
  }

  const invite = await prisma.storeUserInvite.findFirst({
    where: { token, email: user.email },
  });
  if (!invite || new Date() > invite.expiresAt) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Invalid or expired invitation token.",
    );
  }

  await prisma.storeUser.create({
    data: {
      storeId: invite.storeId,
      userId: user.id,
      role: invite.role,
    },
  });

  await prisma.storeUserInvite.delete({ where: { id: invite.id } });

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

  const storeUser = await prisma.storeUser.findFirst({
    where: { storeId, userId: targetUserId },
  });
  if (!storeUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Store user not found.");
  }

  if (storeUser.role === "OWNER") {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Cannot change the OWNER's role.",
    );
  }

  return prisma.storeUser.update({
    where: { id: storeUser.id },
    data: { role: role as any },
  });
};

export const removeStoreUser = async (
  storeId: string,
  targetUserId: string,
) => {
  const storeUser = await prisma.storeUser.findFirst({
    where: { storeId, userId: targetUserId },
  });
  if (!storeUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Store user not found.");
  }

  if (storeUser.role === "OWNER") {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Cannot remove the OWNER from the store.",
    );
  }

  await prisma.storeUser.delete({ where: { id: storeUser.id } });
  return { userId: targetUserId };
};
