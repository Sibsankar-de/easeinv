import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponseHandler";
import { StatusCodes } from "http-status-codes";
import * as invoiceService from "../services/invoice.service";
import { validateBody } from "../utils/validate.utils";
import {
  invoiceCreateUpdateSchema,
  invoiceExportQuerySchema,
  updateInvoiceDueSchema,
} from "../schemas/invoice.schema";
import { InvoiceStatus, InvoicePaymentStatus } from "@prisma/client";

export const createInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { storeId } = req.params as { storeId: string };

    const validatedBody = validateBody(invoiceCreateUpdateSchema, req.body);

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

export const getInvoiceById = asyncHandler(
  async (req: Request, res: Response) => {
    const { invoiceId } = req.params;
    const invoice = await invoiceService.getInvoiceById(invoiceId as string);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, invoice, "Invoice fetched"));
  },
);

export const searchInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "10");
    const status = req.query.status as InvoiceStatus | undefined;
    const paymentStatus = req.query.paymentStatus as
      | InvoicePaymentStatus
      | undefined;
    const customerPrefix = req.query.customerPrefix as string;
    const customerId = req.query.customerId as string;
    const invoiceNumber = req.query.invoiceNumber as string;
    const query = (req.query.query as string) || (req.query.search as string);
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

    const result = await invoiceService.searchInvoice({
      storeId,
      page,
      limit,
      status,
      paymentStatus,
      customerPrefix,
      customerId,
      invoiceNumber,
      query,
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

export const exportInvoices = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };
    const queryParams = invoiceExportQuerySchema.parse(req.query);

    await invoiceService.exportInvoicesStream(storeId, queryParams, res);
  },
);

export const updateInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { storeId, invoiceId } = req.params as {
      storeId: string;
      invoiceId: string;
    };

    const validatedBody = validateBody(invoiceCreateUpdateSchema, req.body);

    const invoice = await invoiceService.updateInvoice(
      userId!,
      storeId,
      invoiceId,
      validatedBody,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          invoice,
          "Invoice updated successfully.",
        ),
      );
  },
);

export const deleteInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    const { invoiceId } = req.params as { invoiceId: string };

    await invoiceService.deleteInvoice(invoiceId);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, null, "Draft invoice deleted."));
  },
);
