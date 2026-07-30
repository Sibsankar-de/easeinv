import { createModuleLogger } from "../utils/logger";
import { startDailyStatComputeJob } from "./dailyStatCompute.cron";

const log = createModuleLogger(import.meta.url);

export const startCronJobs = (): void => {
  startDailyStatComputeJob();

  log.info("All cron jobs started.");
};
