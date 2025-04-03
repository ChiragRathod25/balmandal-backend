import winston from "winston";
import "winston-daily-rotate-file";
import { format } from "winston";

const { combine, timestamp, label, printf } = format;

// Custom log format
const customFormat = printf(({ level, message, label, timestamp, ...meta }) => {
    return `${timestamp} [${label}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
});

// Logger configuration
const logger = winston.createLogger({
    level: "debug",
    format: combine(
        label({ label: "Backend" }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        customFormat
    ),
    transports: [
        // Console Transport (for development)
        new winston.transports.Console({
            format: format.combine(
                format.colorize(),
                customFormat
            )
        }),

        // Error Logs (Rotated Daily)
        new winston.transports.DailyRotateFile({
            filename: "logs/error-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "error",
            maxSize: "10m", // Max file size before rotation - 10MB
            maxFiles: "14d", // Keep logs for 14 days
        }),

        // Request Logs (Rotated Daily)
        new winston.transports.DailyRotateFile({
            filename: "logs/requests-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "info",
            maxSize: "10m",
            maxFiles: "14d",
        }),
    ],
});


if(process.env.NODE_ENV !== 'production') {
    // In development mode, log to the console with colorized output
    logger.add(new winston.transports.Console({
        format: format.combine(
            format.colorize(),
            customFormat
        )
    }));
}
export {logger}
