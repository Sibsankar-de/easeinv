import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponseHandler";
import { StatusCodes } from "http-status-codes";
import { validateBody } from "../utils/validate.utils";
import { submitCustomerQuerySchema } from "../schemas/customerQuery.schema";
import { verifyTurnstileToken } from "../services/turnstile.service";
import * as customerQueryService from "../services/customerQuery.service";

export const submitCustomerQuery = asyncHandler(
  async (req: Request, res: Response) => {
    const validatedBody = validateBody(submitCustomerQuerySchema, req.body);
    await verifyTurnstileToken(validatedBody.turnstileToken, req.ip);

    const queryDto =
      await customerQueryService.createCustomerQuery(validatedBody);

    return res
      .status(StatusCodes.CREATED)
      .json(
        new ApiResponse(
          StatusCodes.CREATED,
          queryDto,
          "Customer query submitted successfully",
        ),
      );
  },
);
