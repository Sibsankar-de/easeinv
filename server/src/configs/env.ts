import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

const parseBoolean = (value: string | undefined): boolean => value === "true";

export const env = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 4000,
  APP_DEBUG: parseBoolean(process.env.APP_DEBUG),

  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  CLIENT_URI: process.env.CLIENT_URI || "http://localhost:3000",
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || "localhost",

  MONGO_CONNECTION_URI: process.env.MONGO_CONNECTION_URI || "",
  DB_NAME: process.env.DB_NAME,

  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,

  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,

  ACCESS_TOKEN_COOKIE_EXPIRY: process.env.ACCESS_TOKEN_COOKIE_EXPIRY,
  REFRESH_TOKEN_COOKIE_EXPIRY: process.env.REFRESH_TOKEN_COOKIE_EXPIRY,

  PASSWORD_RESET_TOKEN_SECRET: process.env.PASSWORD_RESET_TOKEN_SECRET,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER,
} as const;
