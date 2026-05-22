import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "../utils/asynchandler";
import { MiddlewareContext } from "@/types/middleware";
import { ApiResponse } from "../utils/response-handler";
import { ApiError } from "../utils/error-handler";
import { StatusCodes } from "http-status-codes";
import { Invoice } from "../models/invoice.model";
import { Product } from "../models/product.model";
import { Customer } from "../models/customer.model";
import { Store } from "../models/store.model";
import { StoreSettings } from "../models/storeSettings.model";
import mongoose from "mongoose";

export const createInvoice = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const billData = await req.json();
    const { userId } = await context!;
    const { storeId } = await params!;

    const { invoiceNumber, issueDate, total, subTotal, paidAmount, dueAmount } =
      billData;

    if (!invoiceNumber || !issueDate)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Invoice number and issue date is required",
      );

    if ([total, subTotal, paidAmount, dueAmount].some((e) => e === null))
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Calculated amounts are required",
      );

    if (billData?.billItems.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Atleast one bill item is required",
      );
    }

    if (
      ["invoiceNumber", "issueDate", "subTotal", "total"].some(
        (e) => billData[e] === null,
      )
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "All starred fields are required",
      );
    }

    const customerDetails = billData.customerDetails;
    if (!customerDetails.name)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Customer name is required");

    // update the invoice number
    const store = await Store.findByIdAndUpdate(
      storeId,
      {
        $set: {
          lastInvoiceNumber: invoiceNumber,
        },
      },
      { new: true },
    );

    const storeSettings = await StoreSettings.findById(store?.settingsId);

    // get or create new customer
    let customerId = customerDetails?._id;

    if (!customerId) {
      const customer = await createCustomer(storeId, customerDetails);
      customerId = customer._id;
    }

    const newInvoice = await Invoice.create({
      creatorId: userId,
      storeId,
      customerId,
      ...billData,
      extraData: {
        customer: {
          name: customerDetails.name,
          phoneNumber: customerDetails.phoneNumber,
          address: customerDetails.address,
        },
      },
    });

    // update
    await Promise.all([
      // update all products if inventory tracking enabled
      ...(storeSettings?.enableInventoryTracking
        ? billData.billItems.map((item: any) =>
            Product.updateOne(
              {
                _id: item.product.id,
                enabledInventoryTracking: true,
                totalStock: { $gte: item.netQuantity },
              },
              {
                $inc: { totalStock: -item.netQuantity },
              },
            ),
          )
        : []),
      // update customer if there is due
      dueAmount > 0 &&
        Customer.findByIdAndUpdate(customerId, {
          $inc: { totalDue: dueAmount },
        }),
    ]);

    return NextResponse.json(
      new ApiResponse(200, newInvoice, "Invoice created."),
    );
  },
);

const createCustomer = async (
  storeId: string,
  customerDetails: any,
): Promise<any> => {
  const customer = await Customer.create({
    storeId,
    ...customerDetails,
  });
  return customer;
};

export const updateInvoiceDueAmount = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { userId } = await context!;
    const { invoiceId } = await params!;
    const { paidAmount } = await req.json();

    if (paidAmount === null || paidAmount === undefined || paidAmount <= 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Paid amount must be greater than zero",
      );
    }

    const invoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      {
        $inc: {
          paidAmount: paidAmount,
          dueAmount: -paidAmount,
        },
      },
      { new: true },
    );

    if (!invoice) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Invoice not found");
    }

    // update customer due amount
    if (invoice.dueAmount >= 0) {
      await Customer.findByIdAndUpdate(invoice.customerId, {
        $inc: { totalDue: -paidAmount },
      });
    }

    return NextResponse.json(
      new ApiResponse(200, invoice, "Due amount updated."),
    );
  },
);

export const searchInvoice = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { storeId } = await params!;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const customerPrefix = searchParams.get("customerPrefix");
    const customerId = searchParams.get("customerId");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const match: any = {
      storeId: new mongoose.Types.ObjectId(storeId),
    };

    if (status) {
      match.status = status;
    }

    if (customerId) {
      match.customerId = new mongoose.Types.ObjectId(customerId);
    }

    const pipeline: any[] = [
      { $match: match },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: {
          path: "$customerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          customerDetails: {
            $ifNull: ["$customerDetails", "$extraData.customer"],
          },
        },
      },
    ];

    if (customerPrefix) {
      const safeTerm = customerPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      pipeline.push({
        $match: {
          "customerDetails.name": { $regex: new RegExp(`^${safeTerm}`, "i") },
        },
      });
    }

    const options = {
      page,
      limit,
      sort: { [sortBy]: sortOrder },
    };

    const result = await Invoice.aggregatePaginate(pipeline, options);

    return NextResponse.json(
      new ApiResponse(StatusCodes.OK, result, "Invoice list fetched."),
    );
  },
);

export const getInvoiceSummary = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { storeId } = await params!;

    const summaryAgg = await Invoice.aggregate([
      { $match: { storeId: new mongoose.Types.ObjectId(storeId) } },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          totalDue: { $sum: "$dueAmount" },
          totalPaid: { $sum: "$paidAmount" },
          paidCount: {
            $sum: { $cond: [{ $eq: ["$dueAmount", 0] }, 1, 0] },
          },
          dueCount: {
            $sum: { $cond: [{ $gt: ["$dueAmount", 0] }, 1, 0] },
          },
        },
      },
    ]);

    console.log(summaryAgg);

    const summary =
      summaryAgg.length > 0
        ? summaryAgg[0]
        : {
            totalInvoices: 0,
            totalRevenue: 0,
            totalDue: 0,
            totalPaid: 0,
            paidCount: 0,
            dueCount: 0,
          };

    return NextResponse.json(new ApiResponse(200, summary, "Summary fetched."));
  },
);
