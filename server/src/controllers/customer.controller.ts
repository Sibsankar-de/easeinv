import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Customer } from "../models/customer.model";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/ApiError";

export const getCustomers = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "10");
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const pipeline = [
      { $match: { storeId: new mongoose.Types.ObjectId(storeId as string) } },
      {
        $lookup: {
          from: "invoices",
          localField: "_id",
          foreignField: "customerId",
          as: "invoices",
        },
      },
      {
        $addFields: {
          totalInvoices: { $size: "$invoices" },
          dueCount: {
            $size: {
              $filter: {
                input: "$invoices",
                as: "inv",
                cond: { $gt: ["$$inv.dueAmount", 0] },
              },
            },
          },
        },
      },
      {
        $project: {
          invoices: 0,
        },
      },
    ];

    const paginatedList = await Customer.aggregatePaginate(
      Customer.aggregate(pipeline),
      {
        page,
        limit,
        sort: { [sortBy]: sortOrder },
      },
    );

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, paginatedList, "Customers fetched"));
  },
);

export const searchCustomers = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const query = (req.query.query as string) || "";
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "10");
    const sortBy = (req.query.sortBy as string) || "searchScore";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    if (!storeId)
      throw new ApiError(StatusCodes.BAD_REQUEST, "storeId is required");

    const lowerTerm = decodeURIComponent(query).toLowerCase();
    const safeTerm = lowerTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(`^${safeTerm}`, "i");

    const pipeLine = [
      {
        $match: {
          storeId: new mongoose.Types.ObjectId(storeId as string),
          $or: [
            { name: { $regex: regex } },
            { phoneNumber: { $regex: regex } },
          ],
        },
      },
      {
        $addFields: {
          searchScore: {
            $add: [
              {
                $cond: [
                  { $regexMatch: { input: "$name", regex: regex } },
                  100,
                  0,
                ],
              },

              {
                $cond: [
                  { $regexMatch: { input: "$phoneNumber", regex: regex } },
                  50,
                  0,
                ],
              },
            ],
          },
        },
      },
    ];

    const results = await Customer.aggregatePaginate(Customer.aggregate(pipeLine), {
      page,
      limit,
      sort: { [sortBy]: sortOrder, name: 1 },
    });

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, results, "Customers fetched"));
  },
);

export const getCustomerById = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, customerId } = req.params;

    if (!customerId)
      throw new ApiError(StatusCodes.BAD_REQUEST, "customerId is required");

    const pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(customerId as string),
          storeId: new mongoose.Types.ObjectId(storeId as string),
        },
      },
      {
        $lookup: {
          from: "invoices",
          localField: "_id",
          foreignField: "customerId",
          as: "invoices",
        },
      },
      {
        $addFields: {
          totalInvoices: { $size: "$invoices" },
          dueCount: {
            $size: {
              $filter: {
                input: "$invoices",
                as: "inv",
                cond: { $gt: ["$$inv.dueAmount", 0] },
              },
            },
          },
        },
      },
      {
        $project: {
          invoices: 0,
        },
      },
    ];

    const customerData = await Customer.aggregate(pipeline);

    if (!customerData || customerData.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
    }

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          customerData[0],
          "Customer details fetched",
        ),
      );
  },
);

export const deleteCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, customerId } = req.params;

    if (!customerId)
      throw new ApiError(StatusCodes.BAD_REQUEST, "customerId is required");

    const deleted = await Customer.findOneAndDelete({
      _id: customerId,
      storeId,
    });

    if (!deleted) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
    }

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, null, "Customer deleted successfully"));
  },
);

export const updateCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, customerId } = req.params;
    const body = req.body;

    if (!customerId)
      throw new ApiError(StatusCodes.BAD_REQUEST, "customerId is required");

    const { name, phoneNumber, email, address } = body;

    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: customerId, storeId },
      { $set: { name, phoneNumber, email, address } },
      { new: true },
    );

    if (!updatedCustomer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
    }

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
    const { storeId } = req.params;
    const { name, phoneNumber, email, address } = req.body;

    if (!name || !phoneNumber) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Name and phone number are required");
    }

    const customer = await Customer.create({
      name,
      phoneNumber,
      email,
      address,
      storeId: storeId as string,
    });

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, customer, "Customer created successfully"));
  },
);

