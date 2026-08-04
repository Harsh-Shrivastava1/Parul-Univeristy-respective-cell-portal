const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const authService = require('../services/authService');
const { recordAudit } = require('../services/auditService');
const { signAccess, signRefresh, verifyRefresh } = require('../utils/auth');
const { clientIp } = require('../utils/http');
const {
  cookieOptions,
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_MAX_AGE,
} = require('../config/env');

function issueSession(res, session) {
  const claims = { sub: session.userId, role: 'coordinator', name: session.coordinatorName, cellId: session.cellId };
  res.cookie(ACCESS_COOKIE, signAccess(claims), { ...cookieOptions, maxAge: ACCESS_MAX_AGE });
  res.cookie(REFRESH_COOKIE, signRefresh(claims), { ...cookieOptions, maxAge: REFRESH_MAX_AGE });
}

// POST /api/auth/login  (public, rate-limited) — coordinator email + password.
// Accepts `email` (current) or the legacy `cellId` body key as the identifier.
const login = asyncHandler(async (req, res) => {
  const { email, cellId, password } = req.body || {};
  const identifier = email || cellId;
  const ip = clientIp(req);
  try {
    const session = await authService.login(identifier, password);
    issueSession(res, session);
    await recordAudit({ action: 'AUTH_LOGIN', userId: session.userId, userName: session.coordinatorName, entity: 'auth', entityId: session.userId, ip });
    res.json({ success: true, data: session });
  } catch (err) {
    await recordAudit({ action: 'AUTH_LOGIN_FAILED', entity: 'auth', ip, meta: { email: typeof identifier === 'string' ? identifier.slice(0, 40) : null } });
    throw err;
  }
});

// POST /api/auth/refresh  (rotation)
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies && req.cookies[REFRESH_COOKIE];
  if (!token) throw new ApiError(401, 'Not authenticated.');
  let payload;
  try {
    payload = verifyRefresh(token);
  } catch {
    throw new ApiError(401, 'Session expired. Please sign in again.');
  }
  const session = await authService.getProfile(payload.sub);
  issueSession(res, session);
  res.json({ success: true, data: session });
});

// GET /api/auth/me  (coordinator)
const me = asyncHandler(async (req, res) => {
  const session = await authService.getProfile(req.user.sub);
  res.json({ success: true, data: session });
});

// POST /api/auth/change-password  (coordinator, rate-limited)
// Verifies the current password, then updates the coordinator's own passwordHash.
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const ip = clientIp(req);
  try {
    const result = await authService.changePassword(req.user.sub, currentPassword, newPassword);
    await recordAudit({ action: 'AUTH_PASSWORD_CHANGE', userId: result.userId, userName: result.name, entity: 'auth', entityId: result.userId, ip });
    res.json({ success: true, data: { changed: true } });
  } catch (err) {
    await recordAudit({ action: 'AUTH_PASSWORD_CHANGE_FAILED', userId: req.user?.sub, userName: req.user?.name, entity: 'auth', entityId: req.user?.sub, ip });
    throw err;
  }
});

// POST /api/auth/logout  (coordinator)
const logout = asyncHandler(async (req, res) => {
  res.clearCookie(ACCESS_COOKIE, cookieOptions);
  res.clearCookie(REFRESH_COOKIE, cookieOptions);
  await recordAudit({ action: 'AUTH_LOGOUT', userId: req.user?.sub, userName: req.user?.name, entity: 'auth', entityId: req.user?.sub, ip: clientIp(req) });
  res.json({ success: true });
});

module.exports = { login, refresh, me, changePassword, logout };
