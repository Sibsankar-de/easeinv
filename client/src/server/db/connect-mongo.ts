import "server-only";
import mongoose from "mongoose";

const DB_NAME = process.env.DB_NAME;

let isConnected = false;

export const connectMongo = async () => {
  if (isConnected) return;

  try {
    const connection_instance = await mongoose.connect(process.env.MONGO_CONNECTION_URI, {
      dbName: DB_NAME,
    });
    isConnected = true;
    console.log("[MongoDB] Connected - " + connection_instance.connection.host);
  } catch (error) {
    console.error("[MongoDB] Connection failed", error);
    throw error;
  }
};
