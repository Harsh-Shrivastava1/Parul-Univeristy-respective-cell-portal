const logger = require('../config/logger');

/**
 * Central error handler. Operational errors (ApiError / 4xx) return their
 * message; any other/unexpected error is logged in full internally and returns
 * a generic 500 — stack traces and DB errors are never exposed to the client.
 */
const errorHandler = (err, req, res, _next) => {
  const status = Number(err && err.status) || 500;
  const isOperational = status >= 400 && status < 500 && err && err.message;

  if (!isOperational) {
    logger.error('unhandled_error', {
      method: req.method,
      path: req.path,
      status,
      message: err && err.message,
      stack: err && err.stack,
    });
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }

  return res.status(status).json({ success: false, error: err.message });
};

module.exports = errorHandler;
