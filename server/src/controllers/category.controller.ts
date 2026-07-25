import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../utils/validate.utils";
import { createCategorySchema } from "../schemas/category.schema";
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
