import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponseHandler";
import { StatusCodes } from "http-status-codes";
import * as invoiceService from "../services/invoice.service";
import { validateBody } from "../utils/validate.utils";
import {
  createInvoiceSchema,
  updateInvoiceDueSchema,
} from "../schemas/invoice.schema";

export const createInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { storeId } = req.params as { storeId: string };

    const validatedBody = validateBody(createInvoiceSchema, req.body);

    const newInvoice = await invoiceService.createInvoice(
      userId!,
      storeId,
      validatedBody,
    );

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, newInvoice, "Invoice created."));
  },
);

export const updateInvoiceDueAmount = asyncHandler(
  async (req: Request, res: Response) => {
    const { invoiceId } = req.params as { invoiceId: string };

    const validatedBody = validateBody(updateInvoiceDueSchema, req.body);

    const invoice = await invoiceService.updateInvoiceDueAmount(
      invoiceId,
      validatedBody.paidAmount,
    );

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, invoice, "Due amount updated."));
  },
);

export const searchInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "10");
    const status = req.query.status as string;
    const customerPrefix = req.query.customerPrefix as string;
    const customerId = req.query.customerId as string;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

    const result = await invoiceService.searchInvoice({
      storeId,
      page,
      limit,
      status,
      customerPrefix,
      customerId,
      sortBy,
      sortOrder,
    });

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, "Invoice list fetched."));
  },
);

export const getInvoiceSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };

    const summary = await invoiceService.getInvoiceSummary(storeId);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, summary, "Summary fetched."));
  },
);
