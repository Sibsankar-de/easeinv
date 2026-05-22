import "server-only";
import { OAuth2Client } from "google-auth-library";
import { asyncHandler } from "../utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "../utils/error-handler";
import { User } from "../models/user.model";
import { generateAccessAndRefrehToken } from "./user.controller";
import { randomBytes } from "crypto";
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "../utils/cookie-utils";

const client_secret = process.env.GOOGLE_CLIENT_SECRET;
const client_id = process.env.GOOGLE_CLIENT_ID;
const redirectUri = process.env.GOOGLE_CALLBACK_URL;

const oAuth2Client = new OAuth2Client(client_id, client_secret, redirectUri);

const scopes = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
];

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export const authenticateUser = asyncHandler(async (req: NextRequest) => {
  const authorisedUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });

  return NextResponse.redirect(authorisedUrl);
});

// random password generator
export function generatePassword(length: number = 12): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

  const bytes = randomBytes(length);
  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }

  return password;
}

export const googleOauthCallback = asyncHandler(async (req: NextRequest) => {
  const searchParams = new URL(req.url).searchParams;
  const code = searchParams.get("code");

  if (!code) throw new ApiError(400, "Missing code");

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  const userinfoResponse = await oAuth2Client.request({
    url: "https://www.googleapis.com/oauth2/v2/userinfo",
  });

  const userinfo = userinfoResponse.data as GoogleUserInfo;

  if (!userinfo) throw new ApiError(500, "Unable to get user");

  // random password
  const password = generatePassword(16);

  // create user or find existed user;
  let user = await User.findOne({ email: userinfo.email });

  if (!user) {
    user = await User.create({
      userName: userinfo.name,
      email: userinfo.email,
      authBy: "google",
      password,
    });
  }

  if (!user) throw new ApiError(402, "Google log in failed");

  // login user
  const { accessToken, refreshToken } = await generateAccessAndRefrehToken(
    user._id,
  );

  await setAccessTokenCookie(accessToken);
  await setRefreshTokenCookie(refreshToken);

  return NextResponse.redirect(`${process.env.CLIENT_URI}/profile`);
});
