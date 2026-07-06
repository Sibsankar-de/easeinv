import mongoose from "mongoose";
import { Customer } from "../models/customer.model";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import {
  CreateCustomerDTO,
  UpdateCustomerDTO,
} from "../schemas/customer.schema";

export const getCustomers = async (params: {
  storeId: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 1 | -1;
}) => {
  const { storeId, page, limit, sortBy, sortOrder } = params;

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

  const paginatedList = await (Customer as any).aggregatePaginate(
    Customer.aggregate(pipeline),
    {
      page,
      limit,
      sort: { [sortBy]: sortOrder },
    },
  );

  return paginatedList;
};

export const searchCustomers = async (params: {
  storeId: string;
  query: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 1 | -1;
}) => {
  const { storeId, query, page, limit, sortBy, sortOrder } = params;

  if (!storeId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "storeId is required");
  }

  const lowerTerm = decodeURIComponent(query).toLowerCase();
  const safeTerm = lowerTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^${safeTerm}`, "i");

  const pipeline = [
    {
      $match: {
        storeId: new mongoose.Types.ObjectId(storeId),
        $or: [{ name: { $regex: regex } }, { phoneNumber: { $regex: regex } }],
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

  const results = await (Customer as any).aggregatePaginate(
    Customer.aggregate(pipeline),
    {
      page,
      limit,
      sort: { [sortBy]: sortOrder, name: 1 },
    },
  );

  return results;
};

export const getCustomerById = async (storeId: string, customerId: string) => {
  if (!customerId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "customerId is required");
  }

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

  return customerData[0];
};

export const deleteCustomer = async (storeId: string, customerId: string) => {
  if (!customerId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "customerId is required");
  }

  const deleted = await Customer.findOneAndDelete({
    _id: customerId,
    storeId,
  });

  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
  }

  return null;
};

export const updateCustomer = async (
  storeId: string,
  customerId: string,
  customerData: UpdateCustomerDTO,
) => {
  if (!customerId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "customerId is required");
  }

  const { name, phoneNumber, email, address } = customerData;

  const updatedCustomer = await Customer.findOneAndUpdate(
    { _id: customerId, storeId },
    { $set: { name, phoneNumber, email, address } },
    { new: true },
  );

  if (!updatedCustomer) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
  }

  return updatedCustomer;
};

export const createCustomer = async (
  storeId: string | mongoose.Types.ObjectId,
  customerData: CreateCustomerDTO,
) => {
  const { name, phoneNumber, email, address } = customerData;

  if (!name || !phoneNumber) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Name and phone number are required",
    );
  }

  const customer = await Customer.create({
    name,
    phoneNumber,
    email,
    address,
    storeId,
  });

  return customer;
};
