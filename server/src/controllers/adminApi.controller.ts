import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponseHandler";
import { StatusCodes } from "http-status-codes";
import * as adminApiService from "../services/adminApi.service";

export const reindexProducts = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await adminApiService.reindexProducts();

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          result,
          `Re-indexed ${result.indexed} products`,
        ),
      );
  },
);

export const reindexCustomers = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await adminApiService.reindexCustomers();

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          result,
          `Re-indexed ${result.indexed} customers`,
        ),
      );
  },
);
