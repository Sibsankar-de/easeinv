import mongoose from "mongoose";
import { createModuleLogger } from "../utils/logger";
import { env } from "../configs/env";

const log = createModuleLogger(import.meta.url);

export const connectMongo = async () => {
  try {
    const connection_instance = await mongoose.connect(
      env.MONGO_CONNECTION_URI,
      {
        user: env.MONGO_USER,
        pass: env.MONGO_PASS,
        dbName: env.DB_NAME,
      },
    );
    log.info("[MongoDB] Connected - " + connection_instance.connection.host);
  } catch (error) {
    log.error("[MongoDB] Connection failed");
    throw error;
  }
};
