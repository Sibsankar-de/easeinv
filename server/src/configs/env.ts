import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

const parseBoolean = (
  value: string | undefined,
  _default: boolean = false,
): boolean => (value ? value === "true" : _default);

export const env = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 4000,
  APP_DEBUG: parseBoolean(process.env.APP_DEBUG, true),

  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  CLIENT_URL: process.env.CLIENT_URL || "https://easeinv.app",
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || "localhost",

  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: Number(process.env.DB_PORT || 5432),
  DB_USER: process.env.DB_USER || "admin",
  DB_PASSWORD: process.env.DB_PASSWORD || "root",
  DB_NAME: process.env.DB_NAME || "easeinv",
  DB_SSL: parseBoolean(process.env.DB_SSL, true),

  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,

  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || 10,

  ACCESS_TOKEN_COOKIE_EXPIRY: process.env.ACCESS_TOKEN_COOKIE_EXPIRY,
  REFRESH_TOKEN_COOKIE_EXPIRY: process.env.REFRESH_TOKEN_COOKIE_EXPIRY,

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

  EMAIL_RETRY_COUNT: 5,

  RABBITMQ_CONNECTION_URI: process.env.RABBITMQ_CONNECTION_URI,
  RABBITMQ_EMAIL_QUEUE: process.env.RABBITMQ_EMAIL_QUEUE || "email_queue",
  RABBITMQ_NOTIFICATION_QUEUE:
    process.env.RABBITMQ_NOTIFICATION_QUEUE || "notification_queue",

  EMAIL_VERIFICATION_TOKEN_EXPIRY: 10, // in hours
  PASSWORD_RESET_TOKEN_EXPIRY: 1, // in hours

  CLOUDFLARE_TURNSTILE_SECRET: process.env.CLOUDFLARE_TURNSTILE_SECRET,

  SUPPORT_EMAIL: "support@easeinv.app",

  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
  ELASTICSEARCH_PRODUCTS_INDEX:
    process.env.ELASTICSEARCH_PRODUCTS_INDEX || "products",
  ELASTICSEARCH_CUSTOMERS_INDEX:
    process.env.ELASTICSEARCH_CUSTOMERS_INDEX || "customers",
} as const;
