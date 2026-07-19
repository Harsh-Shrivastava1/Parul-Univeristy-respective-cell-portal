const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for authentication endpoints (login / change-password).
 * Protects against brute force without affecting authenticated API performance.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many attempts. Please try again later.' },
});

module.exports = { authLimiter };
