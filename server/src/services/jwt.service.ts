import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../configs/env";
import type { User } from "../types/model";

// Token signing

export const signAccessToken = (
  user: Pick<User, "id" | "email">,
  version: number,
): string =>
  jwt.sign(
    { id: user.id, email: user.email, version },
    env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: env.ACCESS_TOKEN_EXPIRY,
    },
  );

// Token verification

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, env.ACCESS_TOKEN_SECRET) as JwtPayload;
