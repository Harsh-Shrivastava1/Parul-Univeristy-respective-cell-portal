const jwt = require('jsonwebtoken');
const { env, STUDENT_ACCESS_COOKIE } = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * Verify a Student Portal access token (cookie `student_access`, signed with the
 * shared STUDENT_JWT_ACCESS_SECRET) and require the `student` role. Used ONLY by
 * the student-facing Attendance Form download — the Coordinator remains the
 * owner/generator; this just lets the owning student read their own file.
 */
/** Extract a bearer token from the Authorization header, if present. */
function bearerToken(req) {
  const h = req.headers && req.headers.authorization;
  return h && h.startsWith('Bearer ') ? h.slice(7).trim() : null;
}

function requireStudent(req, res, next) {
  // Accept the token from the Authorization: Bearer header (SPA, cross-host) or
  // the student_access cookie (same-host fallback).
  const token = bearerToken(req) || (req.cookies && req.cookies[STUDENT_ACCESS_COOKIE]);
  if (!token) return next(new ApiError(401, 'Not authenticated.'));
  let payload;
  try {
    payload = jwt.verify(token, env.studentJwtAccessSecret);
  } catch {
    return next(new ApiError(401, 'Session expired. Please sign in again.'));
  }
  if (payload.role !== 'student') return next(new ApiError(403, 'Student access only.'));
  req.studentAuth = { sub: payload.sub, role: payload.role, name: payload.name };
  return next();
}

module.exports = { requireStudent };
