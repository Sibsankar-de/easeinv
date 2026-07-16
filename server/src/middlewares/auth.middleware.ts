import { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
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

export const verifyAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken && !refreshToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorised request");
    }

    let user = null;

    try {
      if (!accessToken) throw new Error("No access token.");
      const verifiedToken = verifyAccessToken(accessToken);

      if (!verifiedToken || typeof verifiedToken !== "object") {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token");
      }

      user = await prisma.user.findUnique({
        where: { id: (verifiedToken as JwtPayload).id },
      });
    } catch (_error) {
      if (!refreshToken) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid access token");
      }
      // Attempt silent refresh
      const {
        newAccessToken,
        newRefreshToken,
        user: _user,
      } = await refreshAccessToken(refreshToken);

      res.cookie("accessToken", newAccessToken, accessTokenCookieOptions);
      res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions);

      user = _user;
    }

    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
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
