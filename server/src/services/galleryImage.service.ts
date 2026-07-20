import { createHash } from "crypto";
import { prisma } from "../lib/prisma";
import { uploadToCloudinary } from "./cloudinary.service";
import { cloudinaryFolders } from "../constants/cloudinary.constant";
import { uploadSizeLimits } from "../constants/limits.constants";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import { UpdateImageNameDTO } from "../schemas/galleryImage.schema";
import { paginate } from "../utils/paginate";

export function createFileHash(file: Express.Multer.File): string {
  return createHash("sha256").update(file.buffer).digest("hex");
}

export const uploadGalleryImage = async (params: {
  storeId: string;
  userId: string;
  file?: Express.Multer.File;
}) => {
  const { storeId, userId, file } = params;

  if (!file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Image file is required.");
  }

  if (file.size > uploadSizeLimits.GALLERY_IMAGE) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "File size must be within 4MB");
  }

  const hash = createFileHash(file);
  const existedImage = await prisma.galleryImage.findFirst({
    where: { storeId, hash },
  });
  if (existedImage) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Image already uploaded.");
  }

  const uploadData = await uploadToCloudinary(
    file.buffer,
    file.originalname,
    cloudinaryFolders.GALLERY_IMAGES,
  );
  if (!uploadData) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to upload image",
    );
  }

  return prisma.galleryImage.create({
    data: {
      storeId,
      userId,
      url: uploadData.url,
      publicId: uploadData.public_id,
      hash,
      name: file.originalname,
    },
  });
};

export const updateImageName = async (
  params: UpdateImageNameDTO & {
    imageId: string;
    storeId: string;
  },
) => {
  const { imageId, storeId, name } = params;

  if (!name) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Name is Required.");
  }

  return prisma.galleryImage.updateMany({
    where: { id: imageId, storeId },
    data: { name },
  });
};

export const deleteImage = async (params: {
  imageId: string;
  storeId: string;
}) => {
  const { imageId, storeId } = params;

  const image = await prisma.galleryImage.findFirst({
    where: { id: imageId, storeId },
  });
  if (!image) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Image not found.");
  }

  await prisma.galleryImage.delete({ where: { id: imageId } });
  return null;
};

export const getGalleryImages = async (params: {
  storeId: string;
  page: number;
  limit: number;
  query: string;
}) => {
  const { storeId, page, limit, query } = params;

  const where: any = { storeId };
  if (query) {
    where.name = { contains: query, mode: "insensitive" };
  }

  return paginate(
    prisma.galleryImage,
    where,
    { createdAt: "desc" },
    { page, limit },
  );
};
