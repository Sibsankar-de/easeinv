import { app } from "./app";
import { env } from "./configs/env";
import { connectMongo } from "./db";
import { createModuleLogger } from "./utils/logger";

const log = createModuleLogger(import.meta.url);

let server: any;

connectMongo().then(() => {
  server = app.listen(env.PORT, () => {
    log.info(`Server is running at port ${env.PORT}`);
  });
});

server?.on("error", (error: any) => {
  log.error(`Server error: ${error.message}`);
  throw error;
});
