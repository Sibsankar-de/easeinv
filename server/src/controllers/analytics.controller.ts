import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import * as analyticsService from "../services/analytics.service";

export const getDashboardAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const requestedPeriod = (req.query.period as string) || "daily";

    const payload = await analyticsService.getDashboardAnalytics(
      storeId as string,
      requestedPeriod,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          payload,
          "Dashboard analytics fetched.",
        ),
      );
  },
);
