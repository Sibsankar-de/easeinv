import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { StoreStatus } from "@prisma/client";
import { createModuleLogger } from "../utils/logger";

const log = createModuleLogger(import.meta.url);

export const cleanupDeletedStores = async (): Promise<void> => {
  // Cutoff: stores deleted more than 30 days ago
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  log.info(
    `[storeCleanup] Permanently deleting stores with status=DELETED and deletedAt < ${cutoff.toISOString()}`,
  );

  const result = await prisma.store.deleteMany({
    where: {
      status: StoreStatus.DELETED,
      deletedAt: { lt: cutoff },
    },
  });

  log.info(`[storeCleanup] Permanently deleted ${result.count} store(s).`);
};

export const startStoreCleanupJob = (): void => {
  // Every Monday at 00:00 UTC
  cron.schedule("0 0 * * 1", async () => {
    try {
      await cleanupDeletedStores();
    } catch (err) {
      log.error("[cron] storeCleanup failed: " + err);
    }
  });

  log.info("[cron] storeCleanup scheduled (every Monday at 00:00 UTC).");
};
