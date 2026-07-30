import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../utils/validate.utils";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/category.schema";
import * as categoryService from "../services/category.service";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/apiResponseHandler";

export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;

    const validatedBody = validateBody(createCategorySchema, req.body);

    const category = await categoryService.createCategory(
      storeId as string,
      validatedBody.name,
    );

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, category, "Category created"));
  },
);

export const getCategoriesByStore = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;

    const categories = await categoryService.getCategoriesByStore(
      storeId as string,
    );

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, categories, "Categories fetched"));
  },
);

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, categoryId } = req.params;

    const validatedBody = validateBody(updateCategorySchema, req.body);

    const categoryDto = await categoryService.updateCategory(
      storeId as string,
      categoryId as string,
      validatedBody.name,
    );

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, categoryDto, "Category updated"));
  },
);

export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, categoryId } = req.params;

    const result = await categoryService.deleteCategory(
      storeId as string,
      categoryId as string,
    );

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, "Category deleted"));
  },
);
