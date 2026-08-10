import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import { signAccessToken } from "./jwt.service";
import type {
  CreateUserDTO,
  LoginUserDTO,
  ValidateAndResetPasswordDTO,
} from "../schemas/user.schema";
import { AuthProvider, User } from "@prisma/client";
import { generateSecureToken } from "../utils/token-generator";
import { clientPages } from "../constants/client.constant";
import { VerificationTokenType } from "../enums/verificationToken.enum";
import {
  sendEmailVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from "./transactionalEmail.service";
import * as transactionalNotification from "./transactionalNotification.service";
import { env } from "../configs/env";
import {
  comparePassword,
  hashPassword,
  hashStringSha,
} from "../utils/hash-utils";
import { addDays, addHours } from "../utils/date-utils";

// Token pair helper

export const generateTokenPair = async (user: User) => {
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

  const accessToken = signAccessToken(user, 1);
  const refreshToken = generateSecureToken(128);

  const hashedRefreshToken = hashStringSha(refreshToken);

  // Store the refresh token
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: hashedRefreshToken,
      expiresAt: addDays(new Date(), env.REFRESH_TOKEN_EXPIRY),
    },
  });

  return { accessToken, refreshToken };
};

// Auth flows

export const registerUser = async (userData: CreateUserDTO) => {
  const { userName, email, password } = userData;

  if ([userName, email, password].some((e) => e === "")) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User already exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      userName,
      email,
      password: hashedPassword,
      authBy: AuthProvider.LOCAL,
    },
  });

  sendVerificationEmail(user);

  return null;
};

const sendVerificationEmail = async (user: User) => {
  const token = generateSecureToken(128);
  const verificationLink = clientPages.constructEmailVerificationPageUrl(token);

  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      token,
      type: VerificationTokenType.EMAIL_VERIFICATION_TOKEN,
      expiresAt: addHours(new Date(), env.EMAIL_VERIFICATION_TOKEN_EXPIRY),
    },
  });

  sendEmailVerificationEmail(user, verificationLink);
};

export const verifyEmail = async (token: string) => {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      token,
      type: VerificationTokenType.EMAIL_VERIFICATION_TOKEN,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!verificationToken) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid token.");
  }

  // mark as verified
  const user = await prisma.user.update({
    where: {
      id: verificationToken.userId,
    },
    data: {
      isEmailVerified: true,
    },
  });

  // delete token
  await prisma.verificationToken.delete({
    where: { id: verificationToken.id },
  });

  // send welcome email
  sendWelcomeEmail(user);

  // notify user (fire-and-forget)
  transactionalNotification.notifyEmailVerified(user);

  return null;
};

export const loginUser = async (credentials: LoginUserDTO) => {
  const { email, password } = credentials;

  if ([email, password].some((e) => e === "")) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user)
    throw new ApiError(StatusCodes.FORBIDDEN, "Credentials mismatched.");

  const isValid = await comparePassword(password, user.password);
  if (!isValid)
    throw new ApiError(StatusCodes.FORBIDDEN, "Invalid Credentials");

  const tokens = await generateTokenPair(user);
  return { user, ...tokens };
};

export const logoutUser = async (userId: string, refreshToken: string) => {
  const hashedRefreshToken = hashStringSha(refreshToken);
  await prisma.refreshToken.delete({
    where: { userId, token: hashedRefreshToken },
  });
};

export const requestPasswordReset = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const existingToken = await prisma.verificationToken.findFirst({
    where: {
      userId: user.id,
      type: VerificationTokenType.PASSWORD_RESET_TOKEN,
      expiresAt: { gt: new Date() },
    },
  });

  let token = existingToken?.token;
  if (!token) {
    token = generateSecureToken(128);
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        type: VerificationTokenType.PASSWORD_RESET_TOKEN,
        expiresAt: addHours(new Date(), env.PASSWORD_RESET_TOKEN_EXPIRY),
      },
    });
  }

  const resetLink = clientPages.constructPasswordResetPageUrl(token);
  sendPasswordResetEmail(user, resetLink);

  return null;
};

export const validateAndResetPassword = async (
  body: ValidateAndResetPasswordDTO,
) => {
  const { token, password } = body;

  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      token,
      type: VerificationTokenType.PASSWORD_RESET_TOKEN,
      expiresAt: { gt: new Date() },
    },
  });

  if (!verificationToken) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid or expired token.");
  }

  const user = await prisma.user.findUnique({
    where: { id: verificationToken.userId },
  });

  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User not found.");
  }

  const hashedPassword = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  await prisma.verificationToken.delete({
    where: { id: verificationToken.id },
  });

  // notify user about the password change (fire-and-forget)
  transactionalNotification.notifyPasswordChanged(user);
};

export const resendVerificationEmail = async (user: User) => {
  if (user.isEmailVerified) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Email is already verified.");
  }

  const existingToken = await prisma.verificationToken.findFirst({
    where: {
      userId: user.id,
      type: VerificationTokenType.EMAIL_VERIFICATION_TOKEN,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  let token = existingToken?.token;

  if (!existingToken) {
    token = generateSecureToken(128);
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        type: VerificationTokenType.EMAIL_VERIFICATION_TOKEN,
        expiresAt: addHours(new Date(), env.EMAIL_VERIFICATION_TOKEN_EXPIRY),
      },
    });
  }

  const verificationLink = clientPages.constructEmailVerificationPageUrl(
    token!,
  );
  sendEmailVerificationEmail(user, verificationLink);

  return null;
};
