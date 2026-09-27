import { createModuleLogger } from "../utils/logger";
import { startDailyStatComputeJob } from "./dailyStatCompute.cron";
import { startStoreCleanupJob } from "./storeCleanup.cron";

const log = createModuleLogger(import.meta.url);

export const startCronJobs = (): void => {
  startDailyStatComputeJob();
  startStoreCleanupJob();

  log.info("All cron jobs started.");
};
