import mongoose from "mongoose";
import { createHash } from "crypto";
import { GalleryImage } from "../models/galleryImage.model";
import { ProductImage } from "../models/productImage.model";
import { uploadToCloudinary } from "./cloudinary.service";
import { cloudinaryFolders } from "../constants/cloudinary.constant";
import { uploadSizeLimits } from "../constants/limits.constants";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { UpdateImageNameDTO } from "../schemas/galleryImage.schema";

export function createFileHash(file: Express.Multer.File): string {
  return createHash("sha256").update(file.buffer).digest("hex");
}

export const uploadGalleryImage = async (params: {
  storeId: string | mongoose.Types.ObjectId;
  userId: string | mongoose.Types.ObjectId;
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
  const existedImage = await GalleryImage.findOne({ storeId, hash });
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

  const newImage = await GalleryImage.create({
    storeId,
    userId,
    url: uploadData.url,
    publicId: uploadData.public_id,
    hash,
    name: file.originalname,
  });

  return newImage;
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

  const image = await GalleryImage.findOneAndUpdate(
    { _id: imageId, storeId },
    {
      $set: {
        name,
      },
    },
    { new: true },
  );

  return image;
};

export const deleteImage = async (params: {
  imageId: string;
  storeId: string;
}) => {
  const { imageId, storeId } = params;

  const image = await GalleryImage.findOne({ _id: imageId, storeId });
  if (!image) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Image not found.");
  }

  await Promise.all([image.deleteOne(), ProductImage.deleteMany({ imageId })]);

  return null;
};

export const getGalleryImages = async (params: {
  storeId: string | mongoose.Types.ObjectId;
  page: number;
  limit: number;
  query: string;
}) => {
  const { storeId, page, limit, query } = params;

  const match: any = {
    storeId: new mongoose.Types.ObjectId(storeId as string),
  };

  if (query) {
    const safeTerm = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    match.name = { $regex: new RegExp(safeTerm, "i") };
  }

  const images = await (GalleryImage as any).aggregatePaginate(
    GalleryImage.aggregate([
      {
        $match: match,
      },
      {
        $sort: { createdAt: -1 },
      },
    ]),
    {
      page,
      limit,
    },
  );

  return images;
};
