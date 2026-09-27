import { getChannel } from "../lib/rabbit";
import { createModuleLogger } from "../utils/logger";

const log = createModuleLogger(import.meta.url);

export type ElasticsearchJobAction = "index" | "delete";
export type ElasticsearchJobEntity = "product" | "customer";

export interface ElasticsearchJob {
  action: ElasticsearchJobAction;
  entity: ElasticsearchJobEntity;
  id: string;
  storeId: string;
  data?: Record<string, unknown>;
}

export const ES_QUEUE_NAME = "elasticsearch_queue_v1";

export async function publishElasticsearchJob(
  job: ElasticsearchJob,
): Promise<void> {
  try {
    const channel = await getChannel();
    const buffer = Buffer.from(JSON.stringify(job));
    channel.sendToQueue(ES_QUEUE_NAME, buffer, { persistent: true });
    log.info(`[ES Publisher] Queued: ${job.action} ${job.entity}:${job.id}`);
  } catch (err) {
    log.error(`[ES Publisher] Failed to queue job: ${err}`);
  }
}
