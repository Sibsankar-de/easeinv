import bcrypt from "bcrypt";
import type { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyPasswordResetToken,
} from "./jwt.service";
import type {
  CreateUserDTO,
  LoginUserDTO,
  ValidateAndResetPasswordDTO,
} from "../schemas/user.schema";

// Password helpers

export const hashPassword = (password: string): Promise<string> =>
  bcrypt.hash(password, 10);

export const comparePassword = (
  plain: string,
  hash: string,
): Promise<boolean> => bcrypt.compare(plain, hash);

// Token pair helper

export const generateTokenPair = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken },
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

  await prisma.user.create({
    data: {
      userName,
      email,
      password: await hashPassword(password),
      authBy: "email",
    },
  });

  return {};
};

export const loginUser = async (credentials: LoginUserDTO) => {
  const { email, password } = credentials;

  if ([email, password].some((e) => e === "")) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

  const isValid = await comparePassword(password, user.password);
  if (!isValid) throw new ApiError(StatusCodes.FORBIDDEN, "Invalid password");

  const tokens = await generateTokenPair(user.id);
  return { user, ...tokens };
};

export const logoutUser = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
};

export const refreshAccessToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid request");
  }

  let decoded: JwtPayload;
  try {
    decoded = verifyRefreshToken(refreshToken) as JwtPayload;
  } catch (error: any) {
    if (error?.name === "TokenExpiredError") {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Session expired");
    }
    throw error;
  }

  if (!decoded || !decoded.id) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Session expired");
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || user.refreshToken !== refreshToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token");
  }

  return generateTokenPair(user.id);
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
