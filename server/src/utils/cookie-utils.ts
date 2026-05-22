import { CookieOptions } from "express";
import { env } from "../configs/env";

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  domain: env.COOKIE_DOMAIN,
  path: "/",
};

export const accessTokenCookieOptions: CookieOptions = {
  ...cookieOptions,
  maxAge: env.ACCESS_TOKEN_COOKIE_EXPIRY * 60 * 1000,
};

export const refreshTokenCookieOptions: CookieOptions = {
  ...cookieOptions,
  maxAge: env.REFRESH_TOKEN_COOKIE_EXPIRY * 24 * 60 * 60 * 1000,
};
