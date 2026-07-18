import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/apiResponseHandler";
import * as galleryImageService from "../services/galleryImage.service";
import { validateBody } from "../utils/validate.utils";
import { updateImageNameSchema } from "../schemas/galleryImage.schema";

export const uploadGalleryImage = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!.id;
    const userId = req.user!.id;
    const file = req.file;

    const newImage = await galleryImageService.uploadGalleryImage({
      storeId,
      userId,
      file,
    });

    return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(StatusCodes.CREATED, newImage, "Image uploaded."));
  },
);

export const updateImageName = asyncHandler(
  async (req: Request, res: Response) => {
    const { imageId, storeId } = req.params as {
      imageId: string;
      storeId: string;
    };

    const validatedBody = validateBody(updateImageNameSchema, req.body);

    const image = await galleryImageService.updateImageName({
      imageId,
      storeId,
      name: validatedBody.name,
    });

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, image, "Image name updated."));
  },
);

export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  const { imageId, storeId } = req.params as {
    imageId: string;
    storeId: string;
  };

  await galleryImageService.deleteImage({ imageId, storeId });

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, null, "Image removed."));
});

export const getGalleryImages = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!.id;
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "20");
    const query = (req.query.query as string) || "";

    const images = await galleryImageService.getGalleryImages({
      storeId,
      page,
      limit,
      query,
    });

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, images, "Images fetched."));
  },
);
