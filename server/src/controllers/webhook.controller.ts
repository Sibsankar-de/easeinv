import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponseHandler";
import { StatusCodes } from "http-status-codes";
import * as webhookService from "../services/webhook.service";

/**
 * POST /webhooks
 * Register a new webhook endpoint.
 */
export const createWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { url, secret, events, storeId } = req.body;

    const webhook = await webhookService.createWebhook({
      userId,
      storeId,
      url,
      secret,
      events,
    });

    return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(StatusCodes.CREATED, webhook, "Webhook created."));
  },
);

/**
 * GET /webhooks
 * List registered webhooks for the user.
 */
export const listWebhooks = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const storeId = req.query.storeId as string | undefined;

    const webhooks = await webhookService.listWebhooks({ userId, storeId });

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, webhooks, "Webhooks fetched."));
  },
);

/**
 * DELETE /webhooks/:id
 * Delete a webhook endpoint.
 */
export const deleteWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params as { id: string };

    await webhookService.deleteWebhook(id, userId);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, null, "Webhook deleted."));
  },
);
