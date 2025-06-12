// lib/logger.ts

enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

interface LogDetails {
  [key: string]: any;
}

const log = (level: LogLevel, message: string, details?: LogDetails) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(details && { details }),
  };

  // For now, just console log. Can be expanded to send to a logging service.
  if (level === LogLevel.ERROR) {
    console.error(JSON.stringify(logEntry, null, 2));
  } else if (level === LogLevel.WARN) {
    console.warn(JSON.stringify(logEntry, null, 2));
  } else if (level === LogLevel.INFO) {
    console.info(JSON.stringify(logEntry, null, 2));
  } else {
    console.log(JSON.stringify(logEntry, null, 2));
  }
};

export const logger = {
  error: (message: string, error?: any, context?: LogDetails) => {
    const details: LogDetails = { ...context };
    if (error) {
      details.errorMessage = error instanceof Error ? error.message : String(error);
      if (error instanceof Error && error.stack) {
        details.stack = error.stack;
      }
    }
    log(LogLevel.ERROR, message, details);
  },
  warn: (message: string, details?: LogDetails) => log(LogLevel.WARN, message, details),
  info: (message: string, details?: LogDetails) => log(LogLevel.INFO, message, details),
  debug: (message: string, details?: LogDetails) => log(LogLevel.DEBUG, message, details),
};

// Standardized API error response helper
export const apiErrorResponse = (message: string, status: number = 500, details?: any) => {
  return {
    json: { error: message, ...(details && { details }) },
    status: status,
  };
};
