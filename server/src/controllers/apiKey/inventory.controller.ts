import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponseHandler";
import { ApiError } from "../../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import * as inventoryService from "../../services/inventory.service";
import * as categoryService from "../../services/category.service";
import { validateBody } from "../../utils/validate.utils";
import {
  productCreateUpdateSchema,
  productExportQuerySchema,
} from "../../schemas/product.schema";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../../schemas/category.schema";
import { prisma } from "../../lib/prisma";

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const storeId = req.store!.id;
  const page = parseInt((req.query.page as string) || "1");
  const limit = parseInt((req.query.limit as string) || "20");
  const query = (req.query.query as string) || "";
  const sortBy = (req.query.sortBy as string) || "createdAt";
  const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";
  const categoryId = (req.query.categoryId as string) || undefined;

  const productList = await inventoryService.getProducts({
    storeId,
    page,
    limit,
    query,
    sortBy,
    sortOrder,
    categoryId,
  });

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, productList, "Products fetched"));
});

export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!.id;
    const { productId } = req.params as { productId: string };

    const product = await inventoryService.getPopulatedProductById(productId);

    if (product.storeId !== storeId) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
    }

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, product, "Product fetched"));
  },
);

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const storeId = req.store!.id;

    const validatedBody = validateBody(productCreateUpdateSchema, req.body);

    const product = await inventoryService.createProduct(
      userId,
      storeId,
      validatedBody,
    );

    return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(StatusCodes.CREATED, product, "Product created"));
  },
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!.id;
    const { productId } = req.params as { productId: string };

    const existingProduct = await prisma.product.findFirst({
      where: { id: productId, storeId },
    });
    if (!existingProduct) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
    }

    const validatedBody = validateBody(productCreateUpdateSchema, req.body);

    const product = await inventoryService.updateProduct(
      productId,
      validatedBody,
    );

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, product, "Product updated"));
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!.id;
    const { productId } = req.params as { productId: string };

    const existingProduct = await prisma.product.findFirst({
      where: { id: productId, storeId },
    });
    if (!existingProduct) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
    }

    const result = await inventoryService.deleteProduct(productId);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, "Product deleted"));
  },
);

export const searchProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!.id;
    const query = (req.query.query as string) || "";

    const searchResults = await inventoryService.searchProducts(storeId, query);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, searchResults, "Products fetched"));
  },
);

export const exportProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!.id;
    const queryParams = productExportQuerySchema.parse(req.query);

    await inventoryService.exportProductsStream(storeId, queryParams, res);
  },
);

export const getCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!.id;

    const categories = await categoryService.getCategoriesByStore(storeId);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, categories, "Categories fetched"));
  },
);

export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!.id;

    const validatedBody = validateBody(createCategorySchema, req.body);

    const category = await categoryService.createCategory(
      storeId,
      validatedBody.name,
    );

    return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(StatusCodes.CREATED, category, "Category created"));
  },
);

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!.id;
    const { categoryId } = req.params as { categoryId: string };

    const validatedBody = validateBody(updateCategorySchema, req.body);

    const categoryDto = await categoryService.updateCategory(
      storeId,
      categoryId,
      validatedBody.name,
    );

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, categoryDto, "Category updated"));
  },
);

export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!.id;
    const { categoryId } = req.params as { categoryId: string };

    const result = await categoryService.deleteCategory(storeId, categoryId);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, "Category deleted"));
  },
);
