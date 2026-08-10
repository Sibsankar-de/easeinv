import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { WebhookEvent, Prisma } from "@prisma/client";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import { createModuleLogger } from "../utils/logger";

const log = createModuleLogger(import.meta.url);

export interface TriggerWebhookParams {
  userId?: string;
  storeId?: string;
  event: WebhookEvent;
  payload: any;
}

/**
 * Triggers async HTTP POST requests to all active webhooks subscribed to the event.
 * Never throws — errors are caught and logged internally.
 */
export async function triggerWebhooks({
  userId,
  storeId,
  event,
  payload,
}: TriggerWebhookParams): Promise<void> {
  try {
    const OR: Prisma.WebhookWhereInput[] = [];
    if (userId) OR.push({ userId });
    if (storeId) OR.push({ storeId });

    if (OR.length === 0) return;

    const webhooks = await prisma.webhook.findMany({
      where: {
        isActive: true,
        OR,
        events: {
          hasSome: [event, WebhookEvent.ALL],
        },
      },
    });

    if (webhooks.length === 0) return;

    const timestamp = new Date().toISOString();
    const bodyString = JSON.stringify({
      event,
      timestamp,
      data: payload,
    });

    // Fire HTTP POST to all webhooks in parallel (fire-and-forget)
    await Promise.all(
      webhooks.map(async (webhook) => {
        try {
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "X-Webhook-Event": event,
            "X-Webhook-Timestamp": timestamp,
          };

          if (webhook.secret) {
            const signature = crypto
              .createHmac("sha256", webhook.secret)
              .update(bodyString)
              .digest("hex");
            headers["X-Webhook-Signature"] = signature;
          }

          const response = await fetch(webhook.url, {
            method: "POST",
            headers,
            body: bodyString,
            signal: AbortSignal.timeout(5000), // 5s timeout
          });

          log.info(
            `[Webhook Dispatcher] Sent ${event} to ${webhook.url} (status: ${response.status})`,
          );
        } catch (err) {
          log.error(
            `[Webhook Dispatcher] Failed to post to ${webhook.url}: ${err}`,
          );
        }
      }),
    );
  } catch (err) {
    log.error(`[Webhook Dispatcher] General error: ${err}`);
  }
}

/**
 * Create a new webhook registration.
 */
export async function createWebhook(params: {
  userId?: string;
  storeId?: string;
  url: string;
  secret?: string;
  events?: WebhookEvent[];
}) {
  const { userId, storeId, url, secret, events } = params;

  if (!url || typeof url !== "string") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Webhook URL is required.");
  }

  return prisma.webhook.create({
    data: {
      userId: userId ?? null,
      storeId: storeId ?? null,
      url,
      secret: secret ?? null,
      events: events && events.length > 0 ? events : [WebhookEvent.ALL],
    },
  });
}

/**
 * List webhooks for a user or store.
 */
export async function listWebhooks(params: {
  userId?: string;
  storeId?: string;
}) {
  const { userId, storeId } = params;
  const where: Prisma.WebhookWhereInput = {};
  if (userId) where.userId = userId;
  if (storeId) where.storeId = storeId;

  return prisma.webhook.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Delete a webhook registration by ID.
 */
export async function deleteWebhook(id: string, userId: string) {
  const webhook = await prisma.webhook.findFirst({
    where: { id, userId },
  });

  if (!webhook) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Webhook not found.");
  }

  await prisma.webhook.delete({ where: { id } });
  return null;
}
