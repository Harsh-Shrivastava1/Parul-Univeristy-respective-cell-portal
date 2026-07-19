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

// POST /api/auth/login  (public, rate-limited)
const login = asyncHandler(async (req, res) => {
  const { cellId, password } = req.body || {};
  const ip = clientIp(req);
  try {
    const session = await authService.login(cellId, password);
    issueSession(res, session);
    await recordAudit({ action: 'AUTH_LOGIN', userId: session.userId, userName: session.coordinatorName, entity: 'auth', entityId: session.userId, ip });
    res.json({ success: true, data: session });
  } catch (err) {
    await recordAudit({ action: 'AUTH_LOGIN_FAILED', entity: 'auth', ip, meta: { cellId: typeof cellId === 'string' ? cellId.slice(0, 40) : null } });
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

// POST /api/auth/logout  (coordinator)
const logout = asyncHandler(async (req, res) => {
  res.clearCookie(ACCESS_COOKIE, cookieOptions);
  res.clearCookie(REFRESH_COOKIE, cookieOptions);
  await recordAudit({ action: 'AUTH_LOGOUT', userId: req.user?.sub, userName: req.user?.name, entity: 'auth', entityId: req.user?.sub, ip: clientIp(req) });
  res.json({ success: true });
});

module.exports = { login, refresh, me, logout };
