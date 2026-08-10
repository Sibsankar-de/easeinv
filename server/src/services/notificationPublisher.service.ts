import { env } from "../configs/env";
import { getChannel } from "../lib/rabbit";
import { prisma } from "../lib/prisma";
import { NotificationJob } from "../types/notification";
import { createModuleLogger } from "../utils/logger";
import { emitToUser } from "../lib/socket";
import { triggerWebhooks } from "./webhook.service";
import { toNotificationDto } from "../dto/notification.dto";
import { WebhookEvent } from "@prisma/client";

const log = createModuleLogger(import.meta.url);

const MAIN_QUEUE = `${env.RABBITMQ_NOTIFICATION_QUEUE}_v1`;
const DLQ = `${MAIN_QUEUE}_dlq`;
const MAX_RETRIES = 3;

/**
 * Fire-and-forget: publishes a notification job to RabbitMQ.
 * Never throws — caller errors are caught and logged internally.
 */
export async function publishNotificationJob(job: NotificationJob) {
  const channel = await getChannel();
  const buffer = Buffer.from(JSON.stringify(job));
  channel.sendToQueue(MAIN_QUEUE, buffer, { persistent: true });
  log.info(`[Notification Publisher] Queued: ${job.type} -> user:${job.userId}`);
}

/**
 * RabbitMQ consumer worker.
 * Consumes notification jobs and persists them to the DB.
 * Emit real-time Socket.IO event and trigger webhooks upon save.
 */
export async function startNotificationWorker() {
  const channel = await getChannel();

  // Limit concurrent processing
  channel.prefetch(10);

  log.info("Notification worker consumer started...");

  channel.consume(
    MAIN_QUEUE,
    async (msg) => {
      if (!msg) return;

      let job: NotificationJob | null = null;
      try {
        job = JSON.parse(msg.content.toString()) as NotificationJob;

        const createdNotification = await prisma.notification.create({
          data: {
            userId: job.userId,
            type: job.type as any,
            title: job.title,
            message: job.message,
            metadata: (job.metadata ?? {}) as any,
          },
        });

        const notificationDto = toNotificationDto(createdNotification);

        // 1. Emit real-time WebSocket event via Socket.IO
        emitToUser(job.userId, "notification:new", notificationDto);

        // 2. Trigger webhook delivery (fire-and-forget)
        void triggerWebhooks({
          userId: job.userId,
          storeId: job.metadata?.storeId as string | undefined,
          event: WebhookEvent.NOTIFICATION_DELIVERED,
          payload: notificationDto,
        });

        channel.ack(msg);
        log.info(
          `[Notification Worker] Saved & Emitted: ${job.type} -> user:${job.userId}`,
        );
      } catch (err) {
        const target = job
          ? `type:${job.type} user:${job.userId}`
          : "unknown";
        log.error(`[Notification Worker] Failed to save notification (${target}): ${err}`);

        // Determine how many times this message has already been retried
        const xDeath = msg.properties.headers?.["x-death"];
        let retryCount = 0;
        if (Array.isArray(xDeath)) {
          const entry = xDeath.find((e) => e.queue === MAIN_QUEUE);
          if (entry) retryCount = Number(entry.count);
        }

        if (retryCount < MAX_RETRIES) {
          log.warn(
            `[Notification Worker] Nacking for retry (${retryCount + 1}/${MAX_RETRIES})...`,
          );
          // nack with requeue=false -> DLX routes it to the retry queue
          channel.nack(msg, false, false);
        } else {
          log.error(
            `[Notification Worker] Max retries exceeded. Moving to DLQ.`,
          );
          channel.sendToQueue(DLQ, msg.content, {
            persistent: true,
            headers: {
              ...msg.properties.headers,
              "x-original-error": String(err),
              "x-retry-limit-exceeded": true,
            },
          });
          channel.ack(msg);
        }
      }
    },
    { noAck: false },
  );
}
