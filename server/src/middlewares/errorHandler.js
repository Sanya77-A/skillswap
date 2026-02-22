import { logger } from "../utils/logger.js";

/**
 * Centralized error handler
 * Consistent API response: { success: false, message, errors? }
 */
export const errorHandler = (err, req, res, next) => {
  logger.error(err.message, err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    ...(err.errors && { errors: err.errors }),
  });
};

/**
 * 404 not found handler
 */
export const notFound = (req, res) => {
  res.status(404).json({ success: false, message: "Resource not found" });
};
