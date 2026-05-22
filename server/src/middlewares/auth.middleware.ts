import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { env } from "../configs/env";

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

    let verifiedToken;
    try {
      if (!accessToken) throw new Error("No access token");
      verifiedToken = jwt.verify(
        accessToken,
        env.ACCESS_TOKEN_SECRET as string,
      );
    } catch (error) {
      if (refreshToken) {
        // Attempt to refresh
        try {
          const decodedRefresh = jwt.verify(
            refreshToken,
            env.REFRESH_TOKEN_SECRET as string,
          ) as jwt.JwtPayload;

          const user = await User.findById(decodedRefresh._id);
          if (!user || user.refreshToken !== refreshToken) {
            throw new ApiError(
              StatusCodes.UNAUTHORIZED,
              "Invalid refresh token",
            );
          }

          const newAccessToken = await user.getAccessToken();
          const newRefreshToken = await user.getRefreshToken();

          user.refreshToken = newRefreshToken;
          await user.save({ validateBeforeSave: false });

          const cookieOptions = {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
          };

          res.cookie("accessToken", newAccessToken, cookieOptions);
          res.cookie("refreshToken", newRefreshToken, cookieOptions);

          verifiedToken = jwt.verify(
            newAccessToken,
            env.ACCESS_TOKEN_SECRET as string,
          );
        } catch (refreshError) {
          throw new ApiError(StatusCodes.UNAUTHORIZED, "Session expired");
        }
      } else {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid access token");
      }
    }

    if (!verifiedToken || typeof verifiedToken !== "object") {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token");
    }

    const user = await User.findById(
      (verifiedToken as jwt.JwtPayload)._id,
    ).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
