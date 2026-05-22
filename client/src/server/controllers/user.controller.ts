import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "../utils/asynchandler";
import { ApiError } from "../utils/error-handler";
import { User } from "../models/user.model";
import { ApiResponse } from "../utils/response-handler";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/coludinary-upload";
import { MiddlewareContext } from "@/types/middleware";
import { cloudinaryFolders } from "../constants/cloudinary.constant";
import { StatusCodes } from "http-status-codes";
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "../utils/cookie-utils";

// create user
export const createUser = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { userName, email, password } = body;

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

  return NextResponse.json(
    new ApiResponse(StatusCodes.CREATED, {}, "User created"),
  );
});

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

// log in
export const loginUser = asyncHandler(async (req: NextRequest) => {
  const { email, password } = await req.json();

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
    user?._id,
  );

  await setAccessTokenCookie(accessToken);
  await setRefreshTokenCookie(refreshToken);

  return NextResponse.json(
    new ApiResponse(StatusCodes.OK, {}, "User logged in"),
  );
});

// logout user
export const logoutUser = asyncHandler(async (req: NextRequest) => {
  const token = req.cookies.get("accessToken")?.value;
  if (!token) throw new ApiError(400, "Invalid request");

  const verifiedToken = await jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
  );

  if (
    !verifiedToken ||
    typeof verifiedToken !== "object" ||
    !("_id" in verifiedToken)
  ) {
    throw new ApiError(401, "Unauthorised request");
  }

  const user = await User.findByIdAndUpdate(
    (verifiedToken as jwt.JwtPayload)._id,
    {
      refreshtoken: "",
    },
    { new: true },
  );

  (await cookies()).delete("accessToken");
  (await cookies()).delete("refreshToken");

  return NextResponse.json(
    new ApiResponse(StatusCodes.OK, {}, "User logged out"),
  );
});

export const refreshAccessToken = async (req: NextRequest) => {
  const refreshToken = req.cookies.get("refreshToken")?.value;
  if (!refreshToken)
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid request");

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
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

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefrehToken(user._id);

  await setAccessTokenCookie(newAccessToken);
  await setRefreshTokenCookie(newRefreshToken);

  return newAccessToken;
};

// check for auth
export const checkAuth = asyncHandler(
  async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId } = context!;
    let isAuthenticated = false;
    if (userId) isAuthenticated = true;

    return NextResponse.json(
      new ApiResponse(
        StatusCodes.OK,
        { isAuthenticated },
        "authentication checked",
      ),
    );
  },
);

// update user
export const updateUser = asyncHandler(
  async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId } = context!;
    const { email, userName } = await req.json();
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

    return NextResponse.json(
      new ApiResponse(StatusCodes.OK, updatedUser, "User details updated"),
    );
  },
);

// update password
export const updatePassword = asyncHandler(
  async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId } = context!;
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword)
      throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");

    const user = await User.findById(userId);

    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

    // check current password
    const isPasswordOk = await user.checkPassword(currentPassword);
    if (!isPasswordOk)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid current password");

    user.password = newPassword;
    user.save({ validateBeforeSave: false });

    return NextResponse.json(
      new ApiResponse(StatusCodes.OK, {}, "Password updated"),
    );
  },
);

// update avatar
export const updateAvatar = asyncHandler(
  async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId, files } = context!;

    const user = await User.findById(userId);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

    const image = files?.avatar;
    if (!image)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Avatar file is required");

    const buffer = Buffer.from(await image.arrayBuffer());

    const uploadData = await uploadToCloudinary(
      buffer,
      image.name,
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
    user.save({ validateBeforeSave: false });

    return NextResponse.json(
      new ApiResponse(StatusCodes.OK, user, "Avatar updated"),
    );
  },
);

export const validateAndResetPassword = asyncHandler(
  async (req: NextRequest) => {
    const { token, password } = await req.json();

    if (!token || !password) throw new ApiError(400, "Token is required");

    let decodedToken;
    try {
      decodedToken = jwt.verify(
        token,
        process.env.PASSWORD_RESET_TOKEN_SECRET!,
      );
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Token Expired");
      }
      throw error;
    }

    if (!decodedToken || typeof decodedToken !== "object" || !("_id" in decodedToken))
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token");

    const user = await User.findById((decodedToken as JwtPayload)._id);

    if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, "Token Expired");

    user.password = password;
    await user.save({ validateBeforeSave: false });

    return NextResponse.json(
      new ApiResponse(StatusCodes.OK, {}, "Password reset successfully"),
    );
  },
);

// queries
export const getCurrentUser = asyncHandler(
  async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId } = context!;

    if (!userId)
      throw new ApiError(StatusCodes.BAD_REQUEST, "userid is required");

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

    return NextResponse.json(
      new ApiResponse(StatusCodes.OK, user, "User fetched"),
    );
  },
);
