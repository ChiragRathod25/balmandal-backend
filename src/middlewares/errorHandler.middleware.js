import { logger } from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Log the error with full details
    logger.error("Error Occurred", {
        statusCode,
        message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        params: req.params,
        body: req.body,
    });

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
};
