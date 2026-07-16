import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { StatusCodes } from "http-status-codes";
import * as userService from "../services/user.service";
import * as authService from "../services/auth.service";
import { validateBody } from "../utils/validate.utils";
import {
  createUserSchema,
  loginUserSchema,
  updateUserSchema,
  updatePasswordSchema,
  validateAndResetPasswordSchema,
} from "../schemas/user.schema";
import {
  accessTokenCookieOptions,
  cookieOptions,
  refreshTokenCookieOptions,
} from "../utils/cookie-utils";

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const validatedBody = validateBody(createUserSchema, req.body);
  const result = await authService.registerUser(validatedBody);
  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, result, "User created"));
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const validatedBody = validateBody(loginUserSchema, req.body);
  const { accessToken, refreshToken } =
    await authService.loginUser(validatedBody);

  return res
    .status(StatusCodes.OK)
    .cookie("accessToken", accessToken, accessTokenCookieOptions)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
    .json(new ApiResponse(StatusCodes.OK, {}, "User logged in"));
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  await authService.logoutUser(req.user!.id, refreshToken);

  return res
    .status(StatusCodes.OK)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(StatusCodes.OK, {}, "User logged out"));
});

export const checkAuth = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const isAuthenticated = !!userId;

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

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const validatedBody = validateBody(updateUserSchema, req.body);

  const updatedUser = await userService.updateUser(userId!, validatedBody);

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, updatedUser, "User details updated"));
});

export const updatePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const validatedBody = validateBody(updatePasswordSchema, req.body);

    await userService.updatePassword(userId!, validatedBody);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, {}, "Password updated"));
  },
);

export const updateAvatar = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const file = req.file;

    const user = await userService.updateAvatar(userId!, file);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, user, "Avatar updated"));
  },
);

export const validateAndResetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const validatedBody = validateBody(
      validateAndResetPasswordSchema,
      req.body,
    );

    await authService.validateAndResetPassword(validatedBody);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, {}, "Password reset successfully"));
  },
);

export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const user = await userService.getCurrentUser(userId!);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, user, "User fetched"));
  },
);
