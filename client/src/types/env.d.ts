declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    CORS_ORIGIN: string;
    MONGO_CONNECTION_URI: string;
    DB_NAME: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    ACCESS_TOKEN_EXPIRY: any;
    REFRESH_TOKEN_EXPIRY: any;
    PASSWORD_RESET_TOKEN_SECRET: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_SECRET: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_FOLDER: string;
    GOOGLE_CALLBACK_URI: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    ACCESS_TOKEN_COOKIE_EXPIRY: number;
    REFRESH_TOKEN_COOKIE_EXPIRY: number;
  }
}
