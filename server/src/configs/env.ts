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
  CLIENT_URL: process.env.CLIENT_URL || "https:easeinv.app",
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || "localhost",

  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: Number(process.env.DB_PORT || 5432),
  DB_USER: process.env.DB_USER || "admin",
  DB_PASSWORD: process.env.DB_PASSWORD || "root",
  DB_NAME: process.env.DB_NAME || "easeinv",

  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,

  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || 10,

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

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: Number(process.env.SMTP_PORT),
  SMTP_SECURE: parseBoolean(process.env.SMTP_SECURE),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  MAIL_FROM: process.env.MAIL_FROM,

  RABBITMQ_CONNECTION_URI: process.env.RABBITMQ_CONNECTION_URI,
  RABBITMQ_EMAIL_QUEUE: process.env.RABBITMQ_EMAIL_QUEUE || "email_queue",

  EMAIL_VERIFICATION_TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
} as const;
