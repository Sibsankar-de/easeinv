import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponseHandler";
import * as analyticsService from "../services/analytics.service";
import {
  analyticsQuerySchema,
  categoryAnalyticsQuerySchema,
  customerAnalyticsQuerySchema,
  productAnalyticsQuerySchema,
} from "../schemas/analytics.schema";

export const getDashboardAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const validatedQuery = analyticsQuerySchema.parse(req.query);

    const payload = await analyticsService.getDashboardAnalytics(
      storeId as string,
      validatedQuery,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          payload,
          "Dashboard analytics fetched successfully.",
        ),
      );
  },
);

export const getSalesAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const validatedQuery = analyticsQuerySchema.parse(req.query);

    const payload = await analyticsService.getSalesAnalytics(
      storeId as string,
      validatedQuery,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          payload,
          "Sales analytics fetched successfully.",
        ),
      );
  },
);

export const getProductAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const validatedQuery = productAnalyticsQuerySchema.parse(req.query);

    const payload = await analyticsService.getProductAnalytics(
      storeId as string,
      validatedQuery,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          payload,
          "Product analytics fetched successfully.",
        ),
      );
  },
);

export const getCustomerAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const validatedQuery = customerAnalyticsQuerySchema.parse(req.query);

    const payload = await analyticsService.getCustomerAnalytics(
      storeId as string,
      validatedQuery,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          payload,
          "Customer analytics fetched successfully.",
        ),
      );
  },
);

export const getCategoryAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const validatedQuery = categoryAnalyticsQuerySchema.parse(req.query);

    const payload = await analyticsService.getCategoryAnalytics(
      storeId as string,
      validatedQuery,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          payload,
          "Category analytics fetched successfully.",
        ),
      );
  },
);
