import mongoose from "mongoose";
import { createModuleLogger } from "../utils/logger";
import { env } from "../configs/env";

const log = createModuleLogger(import.meta.url);

const DB_NAME = env.DB_NAME;

export const connectMongo = async () => {
  try {
    const connection_instance = await mongoose.connect(
      env.MONGO_CONNECTION_URI,
      {
        dbName: DB_NAME,
      },
    );
    log.info("[MongoDB] Connected - " + connection_instance.connection.host);
  } catch (error) {
    log.error("[MongoDB] Connection failed");
    throw error;
  }
};
