import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { StatusCodes } from "http-status-codes";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../utils/cookie-utils";
import { clientPages } from "../constants/client.constant";
import * as oauthService from "../services/oauth.service";

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const redirect = req.query.redirect as string;
  const authorisedUrl = oauthService.getGoogleAuthUrl(redirect);
  return res.redirect(authorisedUrl);
});

export const googleAuthCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const state = req.query.state as string;

    const { accessToken, refreshToken } =
      await oauthService.handleGoogleCallback(code);

    const finalRedirect =
      state && state.startsWith("/")
        ? clientPages.constructPageUrl(state)
        : clientPages.PROFILE_PAGE;

    return res
      .status(StatusCodes.OK)
      .cookie("accessToken", accessToken, accessTokenCookieOptions)
      .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
      .redirect(finalRedirect);
  },
);
