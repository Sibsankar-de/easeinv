import { fileURLToPath } from "url";
import path from "path";

import { createLogger, format, transports } from "winston";

import { env } from "../configs/env";

const { combine, timestamp, printf } = format;

// Custom format
const logFormat = printf(({ level, message, timestamp, module }) => {
  return `${timestamp} | ${module || "app"} | ${level.toUpperCase()} | ${message}`;
});

// Determine log level based on debug mode
const isDebugMode = env.APP_DEBUG;
const logLevel = isDebugMode ? "debug" : "info";

// Core logger
const logger = createLogger({
  level: logLevel,
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  transports: [new transports.Console()],
});

type ModuleLogger = {
  info: (message: any) => void;
  error: (message: any) => void;
  warn: (message: any) => void;
  debug: (message: any) => void;
};

export const createModuleLogger = (metaUrl: string): ModuleLogger => {
  const __filename = fileURLToPath(metaUrl);
  const moduleName = path.basename(__filename);

  return {
    info: (message: any) => logger.info(message, { module: moduleName }),
    error: (message: any) => logger.error(message, { module: moduleName }),
    warn: (message: any) => logger.warn(message, { module: moduleName }),
    debug: (message: any) => logger.debug(message, { module: moduleName }),
  };
};

export default logger;
