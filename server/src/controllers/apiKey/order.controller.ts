import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponseHandler";
import { StatusCodes } from "http-status-codes";
import * as orderService from "../../services/order.service";
import * as shippingService from "../../services/shipping.service";
import { validateBody } from "../../utils/validate.utils";
import {
  orderCreateSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
} from "../../schemas/order.schema";
import { calculateShippingSchema } from "../../schemas/shipping.schema";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const storeId = req.store!.id;

  const validatedBody = validateBody(orderCreateSchema, req.body);

  const newOrder = await orderService.createOrder(
    userId,
    storeId,
    validatedBody,
  );

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(
        StatusCodes.CREATED,
        newOrder,
        "Order created successfully.",
      ),
    );
});

export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!.id;
    const { orderId } = req.params as { orderId: string };

    const order = await orderService.getOrderById(storeId, orderId);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, order, "Order fetched successfully."),
      );
  },
);

export const searchOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!.id;
    const queryParams = orderQuerySchema.parse(req.query);

    const result = await orderService.searchOrders({
      ...queryParams,
      storeId,
    });

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, result, "Orders fetched successfully."),
      );
  },
);

export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!.id;
    const { orderId } = req.params as { orderId: string };

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

export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const storeId = req.store!.id;
  const { orderId } = req.params as { orderId: string };

  const result = await orderService.deleteOrder(storeId, orderId);

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, result, result.message));
});

export const calculateOrderShipping = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!.id;
    const validatedBody = validateBody(calculateShippingSchema, req.body);

    const calculation = await shippingService.calculateShippingCharge(
      storeId,
      validatedBody.shippingAddress,
      validatedBody.items,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          calculation,
          "Shipping charge calculated successfully.",
        ),
      );
  },
);
