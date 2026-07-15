import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { StatusCodes } from "http-status-codes";
import * as customerService from "../services/customer.service";
import { validateBody } from "../utils/validate.utils";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../schemas/customer.schema";

export const getCustomers = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "10");
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

    const paginatedList = await customerService.getCustomers({
      storeId,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, paginatedList, "Customers fetched"),
      );
  },
);

export const searchCustomers = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };
    const query = (req.query.query as string) || "";
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "10");
    const sortBy = (req.query.sortBy as string) || "searchScore";
    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

    const results = await customerService.searchCustomers({
      storeId,
      query,
      page,
      limit,
      sortBy,
      sortOrder,
    });
 
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, results, "Customers fetched"));
  },
);
 
export const getCustomerById = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, customerId } = req.params as {
      storeId: string;
      customerId: string;
    };
 
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
 
export const deleteCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, customerId } = req.params as {
      storeId: string;
      customerId: string;
    };
 
    await customerService.deleteCustomer(storeId, customerId);
 
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, null, "Customer deleted successfully"),
      );
  },
);
 
export const updateCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, customerId } = req.params as {
      storeId: string;
      customerId: string;
    };
 
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
 
export const createCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store?.id;

    const validatedBody = validateBody(createCustomerSchema, req.body);

    const customer = await customerService.createCustomer(
      storeId!,
      validatedBody,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          customer,
          "Customer created successfully",
        ),
      );
  },
);
