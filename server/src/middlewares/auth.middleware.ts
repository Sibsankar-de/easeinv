import { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import {
  verifyAccessToken,
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
} from "../services/jwt.service";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../utils/cookie-utils";

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

    let verifiedToken: JwtPayload;

    try {
      if (!accessToken) throw new Error("No access token");
      verifiedToken = verifyAccessToken(accessToken);
    } catch (_error) {
      if (!refreshToken) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid access token");
      }

      // Attempt silent refresh
      try {
        const decodedRefresh = verifyRefreshToken(refreshToken) as JwtPayload;

        const user = await prisma.user.findUnique({
          where: { id: decodedRefresh.id },
        });
        if (!user || user.refreshToken !== refreshToken) {
          throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
        }

        const newAccessToken = signAccessToken(user);
        const newRefreshToken = signRefreshToken(user);

        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: newRefreshToken },
        });

        res.cookie("accessToken", newAccessToken, accessTokenCookieOptions);
        res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions);

        verifiedToken = verifyAccessToken(newAccessToken);
      } catch (_refreshError) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Session expired");
      }
    }

    if (!verifiedToken || typeof verifiedToken !== "object") {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token");
    }

    const user = await prisma.user.findUnique({
      where: { id: (verifiedToken as JwtPayload).id },
      omit: { password: true, refreshToken: true },
    });
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
