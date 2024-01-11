import winston from "winston";
import { ENV } from "src/env";
import DailyRotateFile from "winston-daily-rotate-file";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { application: "my-server" },
  transports: [
    new DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "5m", // Set the maximum size for each log file (e.g., 5 megabytes)
      maxFiles: "14d", // Retain logs for 14 days
    }),
  ],
});

// If we're not in production then log to the `console` with the format:
if (ENV.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// TODO: enable any of these providers for logging solutions

// App signal setup https://blog.appsignal.com/2023/05/18/transport-your-logs-with-winston-to-appsignal.html
// import { WinstonTransport } from "@appsignal/nodejs";
// logger.add(new WinstonTransport({ group: "app" }));

// Loggly setup https://www.loggly.com/blog/effective-logging-in-node-js-microservices/
// import { Loggly } from 'winston-loggly-bulk';
// logger.add(new Loggly({ token: "INSERT LOGGLY TOKEN HERE", subdomain: "INSERT LOGGLY DOMAIN HERE", tags: ["my-app"], json: true }));
