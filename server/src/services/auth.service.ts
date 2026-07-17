import type { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { signAccessToken, verifyPasswordResetToken } from "./jwt.service";
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
} from "./transactionalEmail.service";
import { env } from "../configs/env";
import {
  comparePassword,
  hashPassword,
  hashStringSha,
} from "../utils/hash-utils";
import { addDays, addHours, addMinutes } from "../utils/date-utils";

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
        gte: new Date(),
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

export const validateAndResetPassword = async (
  body: ValidateAndResetPasswordDTO,
) => {
  const { token, password } = body;
  if (!token || !password) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Token and password are required",
    );
  }

  let decoded: JwtPayload;
  try {
    decoded = verifyPasswordResetToken(token) as JwtPayload;
  } catch (error: any) {
    if (error?.name === "TokenExpiredError") {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Token expired");
    }
    throw error;
  }

  if (!decoded || !decoded.id) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token");
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token");

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await hashPassword(password) },
  });
};
