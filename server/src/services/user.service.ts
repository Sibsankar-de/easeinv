import { prisma } from "../lib/prisma";
import { comparePassword, hashPassword } from "./auth.service";
import { deleteFromCloudinary, uploadToCloudinary } from "./cloudinary.service";
import { cloudinaryFolders } from "../constants/cloudinary.constant";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import type { UpdateUserDTO, UpdatePasswordDTO } from "../schemas/user.schema";

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true, refreshToken: true },
  });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  return user;
};

export const updateUser = async (userId: string, data: UpdateUserDTO) => {
  const { email, userName } = data;

  if (!email || !userName) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== userId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Email is already in use");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { userName, email },
    omit: { password: true, refreshToken: true },
  });
};

export const updatePassword = async (
  userId: string,
  data: UpdatePasswordDTO,
) => {
  const { currentPassword, newPassword } = data;

  if (!currentPassword || !newPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

  const isValid = await comparePassword(currentPassword, user.password);
  if (!isValid) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid current password");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { password: await hashPassword(newPassword) },
  });
};

export const updateAvatar = async (
  userId: string,
  file?: Express.Multer.File,
) => {
  if (!file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Avatar file is required");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

  const uploadData = await uploadToCloudinary(
    file.buffer,
    file.originalname,
    cloudinaryFolders.USER_AVATAR,
  );
  if (!uploadData) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to upload avatar",
    );
  }

  if (user.avatar) {
    await deleteFromCloudinary(user.avatar);
  }

  return prisma.user.update({
    where: { id: userId },
    data: { avatar: uploadData.url },
    omit: { password: true, refreshToken: true },
  });
};
