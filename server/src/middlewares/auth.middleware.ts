import { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import { verifyAccessToken, signAccessToken } from "../services/jwt.service";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../utils/cookie-utils";
import { hashStringSha } from "../utils/hash-utils";
import { generateSecureToken } from "../utils/token-generator";
import { env } from "../configs/env";
import { addDays } from "../utils/date-utils";
import { User } from "@prisma/client";

export const verifyAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : authHeader.trim();
      req.user = await verifyViaAuthToken(token);
    } else {
      req.user = await verifyViaCookie(req, res);
    }

    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "User not found");
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const verifyViaAuthToken = async (token: string): Promise<User> => {
  if (!token) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Token is required");
  }

  const authToken = await prisma.authToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!authToken || !authToken.active || authToken.expiresAt < new Date()) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "Invalid or expired authorization token",
    );
  }

  if (!authToken.user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "User not found");
  }

  return authToken.user;
};

export const verifyViaCookie = async (
  req: Request,
  res: Response,
): Promise<User> => {
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;

  if (!accessToken && !refreshToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorised request");
  }

  let user: User | null = null;

  try {
    if (!accessToken) throw new Error("No access token.");
    const verifiedToken = verifyAccessToken(accessToken);

    if (!verifiedToken || typeof verifiedToken !== "object") {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token");
    }

    user = await prisma.user.findUnique({
      where: { id: (verifiedToken as JwtPayload).id },
    });
  } catch {
    if (!refreshToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid access token");
    }
    // Attempt silent refresh
    const {
      newAccessToken,
      newRefreshToken,
      user: refreshedUser,
    } = await refreshAccessToken(refreshToken);

    res.cookie("accessToken", newAccessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions);

    user = refreshedUser;
  }

  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "User not found");
  }

  return user;
};

const refreshAccessToken = async (refreshToken: string) => {
  const refreshTokenHash = hashStringSha(refreshToken);
  const refreshTokenData = await prisma.refreshToken.findFirst({
    where: {
      token: refreshTokenHash,
      revoked: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!refreshTokenData) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Session expired.");
  }

  const user = await prisma.user.findUnique({
    where: { id: refreshTokenData.userId },
  });

  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
  }

  const newAccessToken = signAccessToken(user, 1);

  const newRefreshToken = generateSecureToken(128);
  const newRefreshTokenHash = hashStringSha(newRefreshToken);

  // rotate the refresh token
  await prisma.refreshToken.update({
    where: { id: refreshTokenData.id },
    data: {
      token: newRefreshTokenHash,
      lastSeenAt: new Date(),
      expiresAt: addDays(new Date(), env.REFRESH_TOKEN_EXPIRY),
    },
  });

  return { newAccessToken, newRefreshToken, user };
};
