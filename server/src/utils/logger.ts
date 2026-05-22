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
  info: (message: string) => void;
  error: (message: string) => void;
  warn: (message: string) => void;
  debug: (message: string) => void;
};

export const createModuleLogger = (metaUrl: string): ModuleLogger => {
  const __filename = fileURLToPath(metaUrl);
  const moduleName = path.basename(__filename);

  return {
    info: (message: string) => logger.info(message, { module: moduleName }),
    error: (message: string) => logger.error(message, { module: moduleName }),
    warn: (message: string) => logger.warn(message, { module: moduleName }),
    debug: (message: string) => logger.debug(message, { module: moduleName }),
  };
};

export default logger;
