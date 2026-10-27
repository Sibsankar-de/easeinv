import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponseHandler";
import { StatusCodes } from "http-status-codes";
import * as orderService from "../services/order.service";
import { validateBody } from "../utils/validate.utils";
import {
  orderCreateSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
} from "../schemas/order.schema";

export const createOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { storeId } = req.params as { storeId: string };

    const validatedBody = validateBody(orderCreateSchema, req.body);

    const order = await orderService.createOrder(
      userId!,
      storeId,
      validatedBody,
    );

    return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(StatusCodes.CREATED, order, "Order created successfully."));
  },
);

export const searchOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };
    const queryParams = orderQuerySchema.parse(req.query);

    const result = await orderService.searchOrders({
      ...queryParams,
      storeId,
    });

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, "Orders fetched successfully."));
  },
);

export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, orderId } = req.params as {
      storeId: string;
      orderId: string;
    };

    const order = await orderService.getOrderById(storeId, orderId);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, order, "Order fetched successfully."));
  },
);

export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, orderId } = req.params as {
      storeId: string;
      orderId: string;
    };

    const validatedBody = validateBody(updateOrderStatusSchema, req.body);

    const order = await orderService.updateOrderStatus(
      storeId,
      orderId,
      validatedBody,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          order,
          `Order status updated to ${validatedBody.status}.`,
        ),
      );
  },
);

export const deleteOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, orderId } = req.params as {
      storeId: string;
      orderId: string;
    };

    const result = await orderService.deleteOrder(storeId, orderId);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, result.message));
  },
);
