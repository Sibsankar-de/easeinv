import { NextRequest } from "next/server";
import { ApiError } from "../utils/error-handler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { MiddlewareContext } from "@/types/middleware";
import { StatusCodes } from "http-status-codes";
import { refreshAccessToken } from "../controllers/user.controller";

export const verifyAuth = async (
  req: NextRequest,
  context: MiddlewareContext,
): Promise<MiddlewareContext> => {
  try {
    const accessToken = req.cookies.get("accessToken")?.value;
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!accessToken && !refreshToken)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid request");

    let verifiedToken;
    try {
      verifiedToken = jwt.verify(accessToken!, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      if (
        (error instanceof jwt.TokenExpiredError || !accessToken) &&
        refreshToken
      ) {
        const newAccessToken = await refreshAccessToken(req);
        verifiedToken = jwt.verify(
          newAccessToken,
          process.env.ACCESS_TOKEN_SECRET,
        );
      } else {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          "Invalid or expired token",
        );
      }
    }

    if (
      !verifiedToken ||
      typeof verifiedToken !== "object" ||
      !("_id" in (verifiedToken as jwt.JwtPayload))
    ) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Token expired");
    }

    const user = await User.findById((verifiedToken as jwt.JwtPayload)._id);
    if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid user");

    return { ...context, userId: user._id };
  } catch (error) {
    console.error("Auth verification error:", error);
    throw error instanceof ApiError
      ? error
      : new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Token verification error",
        );
  }
};
