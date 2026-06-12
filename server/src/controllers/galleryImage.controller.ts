import { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { createHash } from "crypto";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { GalleryImage } from "../models/galleryImage.model";
import { uploadToCloudinary } from "../services/cloudinary.service";
import { cloudinaryFolders } from "../constants/cloudinary.constant";
import { ApiResponse } from "../utils/ApiResponse";
import { ProductImage } from "../models/productImage.model";
import { uploadSizeLimits } from "../constants/limits.constants";

export function createFileHash(file: Express.Multer.File): string {
  return createHash("sha256").update(file.buffer).digest("hex");
}

export const uploadGalleryImage = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!._id;
    const userId = req.user!._id;
    const file = req.file;

    if (!file) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Image file is required.");
    }

    if (file.size > uploadSizeLimits.GALLERY_IMAGE) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "File size must be within 4MB",
      );
    }

    const hash = createFileHash(file);
    const existedImage = await GalleryImage.findOne({ storeId, hash });
    if (existedImage) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Image already uploaded.");
    }

    // upload new image
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

    return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(StatusCodes.CREATED, newImage, "Image uploaded."));
  },
);

export const updateImageName = asyncHandler(
  async (req: Request, res: Response) => {
    const { imageId, storeId } = req.params;
    const { name } = req.body;

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

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, image, "Image name updated."));
  },
);

export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  const { imageId, storeId } = req.params;

  const image = await GalleryImage.findOne({ _id: imageId, storeId });
  if (!image) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Image not found.");
  }

  await Promise.all([
    image.deleteOne(),
    // delete related product images
    ProductImage.deleteMany({ imageId }),
  ]);

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, null, "Image removed."));
});

export const getGalleryImages = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!._id;
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "20");
    const query = (req.query.query as string) || "";

    const match: any = {
      storeId: new mongoose.Types.ObjectId(storeId),
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

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, images, "Images fetched."));
  },
);
