import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponseHandler";
import { StatusCodes } from "http-status-codes";
import * as couponService from "../services/coupon.service";
import { validateBody } from "../utils/validate.utils";
import {
  couponCreateUpdateSchema,
  couponFilterQuerySchema,
} from "../schemas/coupon.schema";

export const createCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };
    const userId = req.user?.id;

    const validatedBody = validateBody(couponCreateUpdateSchema, req.body);

    const coupon = await couponService.createCoupon(
      storeId,
      userId!,
      validatedBody,
    );

    return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(StatusCodes.CREATED, coupon, "Coupon created"));
  },
);

export const updateCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, couponId } = req.params as {
      storeId: string;
      couponId: string;
    };

    const validatedBody = validateBody(couponCreateUpdateSchema, req.body);

    const coupon = await couponService.updateCoupon(
      storeId,
      couponId,
      validatedBody,
    );

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, coupon, "Coupon updated"));
  },
);

export const deleteCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, couponId } = req.params as {
      storeId: string;
      couponId: string;
    };

    const result = await couponService.deleteCoupon(storeId, couponId);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, "Coupon deleted"));
  },
);

export const getCouponById = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, couponId } = req.params as {
      storeId: string;
      couponId: string;
    };

    const coupon = await couponService.getCouponById(storeId, couponId);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, coupon, "Coupon fetched"));
  },
);

export const getCoupons = asyncHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId: string };

  const parsedQuery = couponFilterQuerySchema.parse(req.query);

  const couponList = await couponService.getCoupons({
    storeId,
    page: parsedQuery.page,
    limit: parsedQuery.limit,
    query: parsedQuery.query,
    isActive: parsedQuery.isActive,
    discountType: parsedQuery.discountType,
    categoryId: parsedQuery.categoryId,
    sortBy: parsedQuery.sortBy,
    sortOrder: parsedQuery.sortOrder,
  });

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, couponList, "Coupons fetched"));
});
