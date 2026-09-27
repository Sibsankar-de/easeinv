import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponseHandler";
import { StatusCodes } from "http-status-codes";
import * as customerService from "../../services/customer.service";
import { validateBody } from "../../utils/validate.utils";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../../schemas/customer.schema";

export const getCustomers = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!.id;
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "10");
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

    const result = await customerService.getCustomers({
      storeId,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, "Customers fetched"));
  },
);

export const getCustomerById = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!.id;
    const { customerId } = req.params as { customerId: string };

    const customerData = await customerService.getCustomerById(
      storeId,
      customerId,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          customerData,
          "Customer details fetched",
        ),
      );
  },
);

export const createCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!.id;

    const validatedBody = validateBody(createCustomerSchema, req.body);

    const customer = await customerService.createCustomer(
      storeId,
      validatedBody,
    );

    return res
      .status(StatusCodes.CREATED)
      .json(
        new ApiResponse(
          StatusCodes.CREATED,
          customer,
          "Customer created successfully",
        ),
      );
  },
);

export const updateCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!.id;
    const { customerId } = req.params as { customerId: string };

    const validatedBody = validateBody(updateCustomerSchema, req.body);

    const updatedCustomer = await customerService.updateCustomer(
      storeId,
      customerId,
      validatedBody,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          updatedCustomer,
          "Customer updated successfully",
        ),
      );
  },
);

export const deleteCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!.id;
    const { customerId } = req.params as { customerId: string };

    await customerService.deleteCustomer(storeId, customerId);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, null, "Customer deleted successfully"),
      );
  },
);
