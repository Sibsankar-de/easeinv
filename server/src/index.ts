import http from "http";
import { app } from "./app";
import { env } from "./configs/env";
import { connectDB } from "./lib/prisma";
import { initSocketServer } from "./lib/socket";
import { startWorker } from "./services/emailPublisher.service";
import { startNotificationWorker } from "./services/notificationPublisher.service";
import { startCronJobs } from "./cron/index";
import { createModuleLogger } from "./utils/logger";

const log = createModuleLogger(import.meta.url);

const httpServer = http.createServer(app);

// Initialize Socket.IO server singleton
initSocketServer(httpServer);

connectDB().then(() => {
  httpServer.listen(env.PORT, () => {
    log.info(`Server is running at port ${env.PORT} (HTTP & Socket.IO WebSockets)`);
  });

  // start the email worker
  startWorker().catch((err) => {
    log.error("Failed to start email worker: " + err);
  });

  // start the notification worker
  startNotificationWorker().catch((err) => {
    log.error("Failed to start notification worker: " + err);
  });

  // start cron jobs
  startCronJobs();
});

httpServer.on("error", (error: any) => {
  log.error(`Server error: ${error.message}`);
  throw error;
});
