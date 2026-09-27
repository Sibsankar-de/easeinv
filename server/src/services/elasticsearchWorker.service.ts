import { getChannel } from "../lib/rabbit";
import { getElasticsearchClient } from "../lib/elasticsearch";
import { ElasticsearchJob, ES_QUEUE_NAME } from "./elasticsearchPublisher.service";
import { env } from "../configs/env";
import { createModuleLogger } from "../utils/logger";

const log = createModuleLogger(import.meta.url);

const DLQ = `${ES_QUEUE_NAME}_dlq`;
const MAX_RETRIES = 3;

export async function startElasticsearchWorker(): Promise<void> {
  const channel = await getChannel();
  channel.prefetch(5);

  log.info("Elasticsearch worker consumer started...");

  channel.consume(
    ES_QUEUE_NAME,
    async (msg) => {
      if (!msg) return;

      let job: ElasticsearchJob | null = null;
      try {
        job = JSON.parse(msg.content.toString()) as ElasticsearchJob;
        await processJob(job);
        channel.ack(msg);
        log.info(`[ES Worker] Processed: ${job.action} ${job.entity}:${job.id}`);
      } catch (err) {
        const label = job ? `${job.action} ${job.entity}:${job.id}` : "unknown";
        log.error(`[ES Worker] Failed to process job (${label}): ${err}`);

        const xDeath = msg.properties.headers?.["x-death"];
        let retryCount = 0;
        if (Array.isArray(xDeath)) {
          const entry = xDeath.find((e) => e.queue === ES_QUEUE_NAME);
          if (entry) retryCount = Number(entry.count);
        }

        if (retryCount < MAX_RETRIES) {
          log.warn(`[ES Worker] Nacking for retry (${retryCount + 1}/${MAX_RETRIES})...`);
          channel.nack(msg, false, false);
        } else {
          log.error("[ES Worker] Max retries exceeded. Moving to DLQ.");
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

async function processJob(job: ElasticsearchJob): Promise<void> {
  const es = getElasticsearchClient();
  const index =
    job.entity === "product"
      ? env.ELASTICSEARCH_PRODUCTS_INDEX
      : env.ELASTICSEARCH_CUSTOMERS_INDEX;

  if (job.action === "index" && job.data) {
    await es.index({
      index,
      id: job.id,
      document: { ...job.data, storeId: job.storeId },
    });
  } else if (job.action === "delete") {
    await es.delete({ index, id: job.id }).catch((err: any) => {
      if (err?.meta?.statusCode !== 404) throw err;
    });
  }
}
