import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponseHandler";
import { ApiError } from "../../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import * as invoiceService from "../../services/invoice.service";
import { validateBody } from "../../utils/validate.utils";
import { createInvoiceSchema } from "../../schemas/invoice.schema";

export const getInvoiceById = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = req.store!.id;
    const { invoiceId } = req.params as { invoiceId: string };

    const invoice = await invoiceService.getInvoiceById(invoiceId);

    if (invoice.storeId !== storeId) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Invoice not found");
    }

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, invoice, "Invoice fetched"));
  },
);

export const createInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const storeId = req.store!.id;

    const validatedBody = validateBody(createInvoiceSchema, req.body);

    const newInvoice = await invoiceService.createInvoice(
      userId,
      storeId,
      validatedBody,
    );

    return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(StatusCodes.CREATED, newInvoice, "Invoice created."));
  },
);

