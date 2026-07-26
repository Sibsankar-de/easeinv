import { User } from "@prisma/client";

export interface UserResponseDto {
  id: string;
  userName: string;
  email: string;
  avatar: string | null;
  authBy: string;
  isEmailVerified: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export const toUserDto = (user: User): UserResponseDto => {
  return {
    id: user.id,
    userName: user.userName,
    email: user.email,
    avatar: user.avatar,
    authBy: user.authBy,
    isEmailVerified: user.isEmailVerified,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
