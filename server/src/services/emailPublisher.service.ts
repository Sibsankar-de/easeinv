import { env } from "../configs/env";
import { sendMail } from "../lib/mailer";
import { getChannel } from "../lib/rabbit";
import { EmailJob } from "../types/email";
import { createModuleLogger } from "../utils/logger";

const log = createModuleLogger(import.meta.url);

const MAIN_QUEUE = `${env.RABBITMQ_EMAIL_QUEUE}_v2`;
const DLQ = `${MAIN_QUEUE}_dlq`;

export async function publishEmailJob(job: EmailJob) {
  const channel = await getChannel();

  const buffer = Buffer.from(JSON.stringify(job));

  channel.sendToQueue(MAIN_QUEUE, buffer, {
    persistent: true,
  });
}

export async function startWorker() {
  const channel = await getChannel();

  // control concurrency
  channel.prefetch(5);

  log.info("Email worker consumer started...");

  channel.consume(
    MAIN_QUEUE,
    async (msg) => {
      if (!msg) return;

      let job: EmailJob | null = null;
      try {
        job = JSON.parse(msg.content.toString());

        if (job) {
          await sendMail(job);

          channel.ack(msg);

          log.info("[Consumer] Email sent: " + job.to);
        }
      } catch (err) {
        const recipient = job?.to || "unknown";
        log.error(`[Consumer] Email sending failed to ${recipient}: ${err}`);

        // Check retry count in headers
        const xDeath = msg.properties.headers?.["x-death"];
        let retryCount = 0;
        if (xDeath && Array.isArray(xDeath)) {
          const mainQueueEntry = xDeath.find(
            (entry) => entry.queue === MAIN_QUEUE,
          );
          if (mainQueueEntry) {
            retryCount = mainQueueEntry.count;
          }
        }

        if (retryCount < env.EMAIL_RETRY_COUNT) {
          log.warn(
            `[Consumer] Nacking email for ${recipient} to retry (attempt ${retryCount + 1}/5)...`,
          );
          // nack with requeue=false. This routes it to retryQueue due to DLX
          channel.nack(msg, false, false);
        } else {
          log.error(
            `[Consumer] Email sending failed after 5 retries for ${recipient}. Sending to DLQ.`,
          );

          // Publish message directly to DLQ
          channel.sendToQueue(DLQ, msg.content, {
            persistent: true,
            headers: {
              ...msg.properties.headers,
              "x-original-error": String(err),
              "x-retry-limit-exceeded": true,
            },
          });

          // Acknowledge the message so it is removed from the main queue
          channel.ack(msg);
        }
      }
    },
    { noAck: false },
  );
}
