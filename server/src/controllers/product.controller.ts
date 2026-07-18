import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponseHandler";
import { StatusCodes } from "http-status-codes";
import * as inventoryService from "../services/inventory.service";
import { validateBody } from "../utils/validate.utils";
import {
  createProductSchema,
  updateProductSchema,
  rearrangeImagesSchema,
} from "../schemas/product.schema";

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId: string };
  const page = parseInt((req.query.page as string) || "1");
  const limit = parseInt((req.query.limit as string) || "20");
  const query = (req.query.query as string) || "";
  const sortBy = (req.query.sortBy as string) || "createdAt";
  const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

  const productList = await inventoryService.getProducts({
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
});

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const validatedBody = validateBody(createProductSchema, req.body);

    const product = await inventoryService.createProduct(userId!, validatedBody);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, product, "Product created"));
  },
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };

    const validatedBody = validateBody(updateProductSchema, req.body);

    const product = await inventoryService.updateProduct(
      productId,
      validatedBody,
    );

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, product, "Product updated"));
  },
);

export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };

    const product = await inventoryService.getProductById(productId);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, product, "Product fetched"));
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };

    const result = await inventoryService.deleteProduct(productId);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, "Product deleted"));
  },
);

export const rearrangeProductImages = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };

    const validatedBody = validateBody(rearrangeImagesSchema, req.body);

    const productImages = await inventoryService.rearrangeProductImages(
      productId,
      validatedBody.imagePriorities,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          productImages,
          "Images rearranged successfully",
        ),
      );
  },
);

export const searchProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };
    const query = (req.query.query as string) || "";

    const searchResults = await inventoryService.searchProducts(storeId, query);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, searchResults, "Products fetched"));
  },
);
