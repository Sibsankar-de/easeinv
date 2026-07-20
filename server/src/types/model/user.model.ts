import type { User as _User } from "@prisma/client";

// Safe user type (no sensitive fields) for API responses
export type User = _User;

// JWT payload shapes
export interface AccessTokenPayload {
  id: string;
  email: string;
}

export interface RefreshTokenPayload {
  id: string;
}

export interface PasswordResetTokenPayload {
  id: string;
  email: string;
}
