import mongoose from "mongoose";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { deleteFromCloudinary, uploadToCloudinary } from "./cloudinary.service";
import { cloudinaryFolders } from "../constants/cloudinary.constant";
import { env } from "../configs/env";
import {
  CreateUserDTO,
  LoginUserDTO,
  UpdateUserDTO,
  UpdatePasswordDTO,
  ValidateAndResetPasswordDTO,
} from "../schemas/user.schema";

export const generateAccessAndRefrehToken = async (
  userId: mongoose.Types.ObjectId | string,
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
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal error on generating tokens",
    );
  }
};

export const createUser = async (userData: CreateUserDTO) => {
  const { userName, email, password } = userData;

  if ([userName, email, password].some((e) => e === "")) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User already exist");
  }

  const newUser = await User.create({
    userName,
    email,
    password,
    authBy: "email",
  });

  if (!newUser) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Failed to create user");
  }

  return {};
};

export const loginUser = async (credentials: LoginUserDTO) => {
  const { email, password } = credentials;

  if ([email, password].some((e) => e === "")) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");
  }

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not exist");

  const isPasswordOk = await user.checkPassword(password);
  if (!isPasswordOk) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Invalid password");
  }

  const tokens = await generateAccessAndRefrehToken(
    user._id as mongoose.Types.ObjectId,
  );

  return { user, ...tokens };
};

export const logoutUser = async (userId: string | mongoose.Types.ObjectId) => {
  await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true },
  );
};

export const refreshAccessToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid request");
  }

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

  const tokens = await generateAccessAndRefrehToken(
    user._id as mongoose.Types.ObjectId,
  );

  return tokens;
};

export const updateUser = async (
  userId: string | mongoose.Types.ObjectId,
  userData: UpdateUserDTO,
) => {
  const { email, userName } = userData;

  if (!email || !userName) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");
  }

  const user = await User.findById(userId);
  if (email !== user?.email) {
    const userByNewEmail = await User.findOne({ email });
    if (userByNewEmail) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Email is already in use");
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      userName,
      email,
    },
    { new: true },
  ).select("-password -refreshToken");

  return updatedUser;
};

export const updatePassword = async (
  userId: string | mongoose.Types.ObjectId,
  passwords: UpdatePasswordDTO,
) => {
  const { currentPassword, newPassword } = passwords;
  if (!currentPassword || !newPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");
  }

  const user = await User.findById(userId);
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

  const isPasswordOk = await user.checkPassword(currentPassword);
  if (!isPasswordOk) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid current password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
};

export const updateAvatar = async (
  userId: string | mongoose.Types.ObjectId,
  file?: Express.Multer.File,
) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

  if (!file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Avatar file is required");
  }

  const buffer = file.buffer;
  const uploadData = await uploadToCloudinary(
    buffer,
    file.originalname,
    cloudinaryFolders.USER_AVATAR,
  );

  if (!uploadData) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to upload avatar",
    );
  }

  if (user.avatar) {
    await deleteFromCloudinary(user.avatar);
  }

  user.avatar = uploadData.url;
  await user.save({ validateBeforeSave: false });

  return user;
};

export const validateAndResetPassword = async (
  body: ValidateAndResetPasswordDTO,
) => {
  const { token, password } = body;

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
  ) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token");
  }

  const user = await User.findById((decodedToken as JwtPayload)._id);

  if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, "Token Expired");

  user.password = password;
  await user.save({ validateBeforeSave: false });
};

export const getCurrentUser = async (
  userId: string | mongoose.Types.ObjectId,
) => {
  if (!userId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "userid is required");
  }

  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

  return user;
};
