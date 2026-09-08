const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for authentication endpoints (login / change-password).
 * Protects against brute force without affecting authenticated API performance.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  // There can be many coordinators (up to one per department) and they all sit
  // behind the same campus NAT (one public IP), so 10/15min locked out real
  // cohorts. 100/15min absorbs a group logging in together while still capping
  // brute force on these department-scoped accounts (bcrypt(12)).
  max: 100, // per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many attempts. Please try again later.' },
});

module.exports = { authLimiter };
