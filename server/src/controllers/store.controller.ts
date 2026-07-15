import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { StatusCodes } from "http-status-codes";
import * as storeService from "../services/store.service";
import { validateBody } from "../utils/validate.utils";
import {
  createStoreSchema,
  updateStoreSchema,
  updateStoreSettingsSchema,
  createCategorySchema,
} from "../schemas/store.schema";

export const createStore = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  const validatedBody = validateBody(createStoreSchema, req.body);

  const store = await storeService.createStore(userId!, validatedBody);

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(StatusCodes.OK, store, "Store created successfully!"),
    );
});

export const updateStore = asyncHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId: string };
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const validatedBody = validateBody(updateStoreSchema, req.body);

  const updatedStore = await storeService.updateStore(storeId, validatedBody, files);

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, updatedStore, "Store updated"));
});

export const deleteStore = asyncHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId: string };

  await storeService.deleteStore(storeId);

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, null, "Store deleted successfully"));
});

export const updateStoreSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };
    
    const validatedBody = validateBody(updateStoreSettingsSchema, req.body);

    const updatedStoreSettings = await storeService.updateStoreSettings(
      storeId,
      validatedBody,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          updatedStoreSettings,
          "Store settings updated",
        ),
      );
  },
);

export const uploadStoreLogo = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };
    const file = req.file;

    const logoUrl = await storeService.uploadStoreLogo(storeId, file);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          { logoUrl },
          "Logo uploaded successfully!",
        ),
      );
  },
);

export const uploadInvoicePaymentQrCode = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };
    const file = req.file;

    const qrCodeUrl = await storeService.uploadInvoicePaymentQrCode(storeId, file);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          { qrCodeUrl },
          "QR code uploaded successfully!",
        ),
      );
  },
);

export const getStoreList = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const storeList = await storeService.getStoreList(userId!);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, storeList, "Stores fetched"));
  },
);

export const getStoreDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };

    const storeDetails = await storeService.getStoreDetails(storeId);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          storeDetails,
          "Store fetched",
        ),
      );
  },
);

export const getProductsByStore = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "20");
    const query = (req.query.query as string) || "";
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

    const productList = await storeService.getProductsByStore({
      storeId,
      page,
      limit,
      query,
      sortBy,
      sortOrder,
    });

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, productList, "Products fetched"));
  },
);

export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };
    
    const validatedBody = validateBody(createCategorySchema, req.body);

    const category = await storeService.createCategory(storeId, validatedBody.name);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, category, "Category created"));
  },
);

export const getCategoriesByStore = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };

    const categories = await storeService.getCategoriesByStore(storeId);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, categories, "Categories fetched"));
  },
);
