import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/prisma";
import { generateTokenPair, hashPassword } from "./auth.service";
import { randomBytes } from "crypto";
import { StatusCodes } from "http-status-codes";
import { env } from "../configs/env";
import { clientPages } from "../constants/client.constant";
import { ApiError } from "../utils/ApiError";

const client_secret = env.GOOGLE_CLIENT_SECRET;
const client_id = env.GOOGLE_CLIENT_ID;
const redirectUri = env.GOOGLE_CALLBACK_URL;

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

export const getGoogleAuthUrl = (redirect?: string) => {
  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    state: redirect || clientPages.PROFILE_PAGE,
  });
};

export const handleGoogleCallback = async (code: string) => {
  if (!code) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Missing code");
  }

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  const userinfoResponse = await oAuth2Client.request({
    url: "https://www.googleapis.com/oauth2/v2/userinfo",
  });

  const userinfo = userinfoResponse.data as GoogleUserInfo;
  if (!userinfo) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Unable to get user");
  }

  const password = generatePassword(16);

  let user = await prisma.user.findUnique({ where: { email: userinfo.email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        userName: userinfo.name,
        email: userinfo.email,
        authBy: "google",
        password: await hashPassword(password),
      },
    });
  }

  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Google login failed");
  }

  const { accessToken, refreshToken } = await generateTokenPair(user.id);
  return { user, accessToken, refreshToken };
};
