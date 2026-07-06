import mongoose from "mongoose";
import { Invoice } from "../models/invoice.model";
import { Product } from "../models/product.model";
import { Customer } from "../models/customer.model";
import { Store } from "../models/store.model";
import { StoreSettings } from "../models/storeSettings.model";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { CreateInvoiceDTO } from "../schemas/invoice.schema";

export const createInvoice = async (
  userId: string | mongoose.Types.ObjectId,
  storeId: string,
  billData: CreateInvoiceDTO,
) => {
  const { invoiceNumber, issueDate, total, subTotal, paidAmount, dueAmount } =
    billData;

  if (!invoiceNumber || !issueDate) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Invoice number and issue date is required",
    );
  }

  if ([total, subTotal, paidAmount, dueAmount].some((e) => e === null)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Calculated amounts are required",
    );
  }

  if (billData?.billItems.length === 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Atleast one bill item is required",
    );
  }

  if (
    ["invoiceNumber", "issueDate", "subTotal", "total"].some(
      (e) => (billData as any)[e] === null,
    )
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "All starred fields are required",
    );
  }

  const customerDetails = billData.customerDetails;
  if (!customerDetails.name) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Customer name is required");
  }

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

  let customerId = customerDetails?._id;

  if (!customerId) {
    const customer = await Customer.create({
      storeId,
      ...customerDetails,
    });
    customerId = customer._id.toString();
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

  await Promise.all([
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
    dueAmount > 0 &&
      Customer.findByIdAndUpdate(customerId, {
        $inc: { totalDue: dueAmount },
      }),
  ]);

  return newInvoice;
};

export const updateInvoiceDueAmount = async (
  invoiceId: string,
  paidAmount: number,
) => {
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

  if (invoice.dueAmount >= 0) {
    await Customer.findByIdAndUpdate(invoice.customerId, {
      $inc: { totalDue: -paidAmount },
    });
  }

  return invoice;
};

export const searchInvoice = async (params: {
  storeId: string;
  page: number;
  limit: number;
  status?: string;
  customerPrefix?: string;
  customerId?: string;
  sortBy: string;
  sortOrder: 1 | -1;
}) => {
  const {
    storeId,
    page,
    limit,
    status,
    customerPrefix,
    customerId,
    sortBy,
    sortOrder,
  } = params;

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

  const result = await (Invoice as any).aggregatePaginate(
    Invoice.aggregate(pipeline),
    options,
  );

  return result;
};

export const getInvoiceSummary = async (storeId: string) => {
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

  return summary;
};
