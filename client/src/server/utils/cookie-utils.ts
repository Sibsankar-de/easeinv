import { cookies } from "next/headers";

export const setAccessTokenCookie = async (accessToken: string) => {
  const expiryInMinutes = Number(process.env.ACCESS_TOKEN_COOKIE_EXPIRY) || 15;
  const maxAge = expiryInMinutes * 60;

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    path: "/",
    maxAge: maxAge,
  };

  (await cookies()).set("accessToken", accessToken, cookieOptions);
};

export const setRefreshTokenCookie = async (refreshToken: string) => {
  const expiryInDays = Number(process.env.REFRESH_TOKEN_COOKIE_EXPIRY) || 10;
  const maxAge = expiryInDays * 24 * 60 * 60;

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    path: "/",
    maxAge: maxAge,
  };

  (await cookies()).set("refreshToken", refreshToken, cookieOptions);
};
