import { app } from "./app";
import { env } from "./configs/env";
import { connectDB } from "./lib/prisma";
import { startWorker } from "./services/emailPublisher.service";
import { createModuleLogger } from "./utils/logger";

const log = createModuleLogger(import.meta.url);

let server: any;

connectDB().then(() => {
  server = app.listen(env.PORT, () => {
    log.info(`Server is running at port ${env.PORT}`);
  });

  // start the email worker
  startWorker().catch((err) => {
    log.error("Failed to start email worker: " + err);
  });
});

server?.on("error", (error: any) => {
  log.error(`Server error: ${error.message}`);
  throw error;
});
