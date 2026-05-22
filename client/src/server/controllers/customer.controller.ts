import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "../utils/asynchandler";
import { MiddlewareContext } from "@/types/middleware";
import { Customer } from "../models/customer.model";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/response-handler";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/error-handler";

export const getCustomersPaged = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { storeId } = await params!;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const pipeline = [
      { $match: { storeId: new mongoose.Types.ObjectId(storeId) } },
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

    const paginatedList = await Customer.aggregatePaginate(pipeline, {
      page,
      limit,
      sort: { [sortBy]: sortOrder },
    });

    return NextResponse.json(
      new ApiResponse(StatusCodes.OK, paginatedList, "Customers fetched"),
    );
  },
);

export const searchCustomers = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { storeId } = await params!;
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "searchScore";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    if (!storeId)
      throw new ApiError(StatusCodes.BAD_REQUEST, "storeId is required");

    const lowerTerm = decodeURIComponent(query).toLowerCase();
    const safeTerm = lowerTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(`^${safeTerm}`, "i");

    const pipeLine = [
      {
        $match: {
          storeId: new mongoose.Types.ObjectId(storeId),
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

    const results = await Customer.aggregatePaginate(pipeLine, {
      page,
      limit,
      sort: { [sortBy]: sortOrder, name: 1 },
    });

    return NextResponse.json(
      new ApiResponse(StatusCodes.OK, results, "Customers fetched"),
    );
  },
);

export const getCustomerById = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { storeId, customerId } = await params!;

    if (!customerId)
      throw new ApiError(StatusCodes.BAD_REQUEST, "customerId is required");

    const pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(customerId),
          storeId: new mongoose.Types.ObjectId(storeId),
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

    return NextResponse.json(
      new ApiResponse(
        StatusCodes.OK,
        customerData[0],
        "Customer details fetched",
      ),
    );
  },
);

export const removeCustomerById = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { storeId, customerId } = await params!;

    if (!customerId)
      throw new ApiError(StatusCodes.BAD_REQUEST, "customerId is required");

    const deleted = await Customer.findOneAndDelete({
      _id: customerId,
      storeId,
    });

    if (!deleted) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
    }

    return NextResponse.json(
      new ApiResponse(StatusCodes.OK, null, "Customer deleted successfully"),
    );
  },
);

export const updateCustomerById = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { storeId, customerId } = await params!;
    const body = await req.json();

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

    return NextResponse.json(
      new ApiResponse(
        StatusCodes.OK,
        updatedCustomer,
        "Customer updated successfully",
      ),
    );
  },
);
