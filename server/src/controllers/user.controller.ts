import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";
import { ApiResponse } from "../utils/ApiResponse";
import mongoose from "mongoose";
import jwt, { JwtPayload } from "jsonwebtoken";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary";
import { cloudinaryFolders } from "../constants/cloudinary.constant";
import { StatusCodes } from "http-status-codes";
import { env } from "../configs/env";
import {
  accessTokenCookieOptions,
  cookieOptions,
  refreshTokenCookieOptions,
} from "../utils/cookie-utils";

// generate tokens
export const generateAccessAndRefrehToken = async (
  userId: mongoose.Types.ObjectId,
) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    const accessToken = await user.getAccessToken();
    const refreshToken = await user.getRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal error on generating tokens",
    );
  }
};

// create user
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { userName, email, password } = req.body;

  if ([userName, email, password].some((e) => e === ""))
    throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");

  const existedUser = await User.findOne({ email });
  if (existedUser)
    throw new ApiError(StatusCodes.BAD_REQUEST, "User already exist");

  const newUser = await User.create({
    userName,
    email,
    password,
    authBy: "email",
  });

  if (!newUser)
    throw new ApiError(StatusCodes.FORBIDDEN, "Failed to create user");

  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, {}, "User created"));
});

// log in
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if ([email, password].some((e) => e === ""))
    throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");

  // check email
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not exist");

  // check password
  const isPasswordOk = await user.checkPassword(password);
  if (!isPasswordOk)
    throw new ApiError(StatusCodes.FORBIDDEN, "Invalid password");

  const { accessToken, refreshToken } = await generateAccessAndRefrehToken(
    user._id as mongoose.Types.ObjectId,
  );

  return res
    .status(StatusCodes.OK)
    .cookie("accessToken", accessToken, accessTokenCookieOptions)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
    .json(new ApiResponse(StatusCodes.OK, {}, "User logged in"));
});

// logout user
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true },
  );

  return res
    .status(StatusCodes.OK)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(StatusCodes.OK, {}, "User logged out"));
});

export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid request");

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET!);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Session expired");
      }
      throw error;
    }

    if (!decoded || typeof decoded !== "object" || !("_id" in decoded)) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Session expired");
    }

    const user = await User.findById((decoded as jwt.JwtPayload)._id);
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token");
    }

    if (refreshToken !== user?.refreshToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token");
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefrehToken(user._id as mongoose.Types.ObjectId);

    return res
      .status(StatusCodes.OK)
      .cookie("accessToken", newAccessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          { accessToken: newAccessToken },
          "Access token refreshed",
        ),
      );
  },
);

// check for auth
export const checkAuth = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  let isAuthenticated = false;
  if (userId) isAuthenticated = true;

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        { isAuthenticated },
        "authentication checked",
      ),
    );
});

// update user
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { email, userName } = req.body;
  if (!email || !userName)
    throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");

  // check for new email
  const user = await User.findById(userId);
  if (email !== user?.email) {
    const userByNewEmail = await User.findOne({ email });
    if (userByNewEmail)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Email is already in use");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      userName,
      email,
    },
    { new: true },
  ).select("-password -refreshToken");

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, updatedUser, "User details updated"));
});

// update password
export const updatePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");

    const user = await User.findById(userId);

    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

    // check current password
    const isPasswordOk = await user.checkPassword(currentPassword);
    if (!isPasswordOk)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid current password");

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, {}, "Password updated"));
  },
);

// update avatar
export const updateAvatar = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const user = await User.findById(userId);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

    const file = req.file;
    if (!file)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Avatar file is required");

    const buffer = file.buffer;

    const uploadData = await uploadToCloudinary(
      buffer,
      file.originalname,
      cloudinaryFolders.USER_AVATAR,
    );
    if (!uploadData)
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to upload avatar",
      );

    if (user.avatar) {
      await deleteFromCloudinary(user.avatar);
    }

    user.avatar = uploadData.url;
    await user.save({ validateBeforeSave: false });

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, user, "Avatar updated"));
  },
);

export const validateAndResetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, password } = req.body;

    if (!token || !password) throw new ApiError(400, "Token is required");

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, env.PASSWORD_RESET_TOKEN_SECRET!);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Token Expired");
      }
      throw error;
    }

    if (
      !decodedToken ||
      typeof decodedToken !== "object" ||
      !("_id" in decodedToken)
    )
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token");

    const user = await User.findById((decodedToken as JwtPayload)._id);

    if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, "Token Expired");

    user.password = password;
    await user.save({ validateBeforeSave: false });

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, {}, "Password reset successfully"));
  },
);

// queries
export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    if (!userId)
      throw new ApiError(StatusCodes.BAD_REQUEST, "userid is required");

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, user, "User fetched"));
  },
);
