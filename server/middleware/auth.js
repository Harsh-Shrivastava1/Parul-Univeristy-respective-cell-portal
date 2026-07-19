const { verifyAccess } = require('../utils/auth');
const { ACCESS_COOKIE } = require('../config/env');
const ApiError = require('../utils/ApiError');

/** Requires a valid access token cookie; attaches req.user = { sub, role, name, cellId }. */
function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies[ACCESS_COOKIE];
  if (!token) return next(new ApiError(401, 'Not authenticated.'));
  try {
    req.user = verifyAccess(token);
    return next();
  } catch {
    return next(new ApiError(401, 'Session expired. Please sign in again.'));
  }
}

/** Restricts a route to coordinator accounts only. */
function requireCoordinator(req, res, next) {
  if (!req.user || req.user.role !== 'coordinator') {
    return next(new ApiError(403, 'Coordinator access only.'));
  }
  return next();
}

module.exports = { requireAuth, requireCoordinator };
