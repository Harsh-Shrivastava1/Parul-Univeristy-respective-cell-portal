const User = require('../models/User');
const Cell = require('../models/Cell');
const ApiError = require('../utils/ApiError');
const { comparePassword } = require('../utils/auth');
const { loadCoordinator, sessionCell } = require('../utils/identity');

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Build the AuthSession object the frontend expects. */
function toSession(user, cell) {
  const sc = sessionCell(cell, user);
  return {
    userId: user.id,
    cellId: sc.cellId,
    cellName: sc.cellName,
    coordinatorName: user.name || '',
    coordinatorEmail: user.email || '',
    department: sc.department,
    role: 'coordinator',
    isAuthenticated: true,
    loginTime: new Date().toISOString(),
  };
}

/**
 * Coordinator login. The frontend sends a "cellId" identifier + password; it is
 * matched against an Admin-created coordinator account (users, role
 * 'coordinator') either directly by email, or via the cell login id / cell id
 * whose `coordinatorId` points to the user. Passwords are verified with bcrypt.
 */
async function login(identifier, password) {
  if (!identifier || !password) throw new ApiError(400, 'Cell ID and password are required.');
  const id = String(identifier).trim();

  // Resolve candidate coordinator user by cell identity or by email.
  let user = null;
  const cell = await Cell.findOne({
    $or: [{ id }, { cellId: id }, { loginId: id }, { name: id }],
  }).lean();
  // Admin-owned cells carry the coordinator reference as `coordinatorId` or, in
  // the shared schema, `officerId`. Accept either so login resolves regardless
  // of which field the writing portal populated.
  const coordinatorRef = cell && (cell.coordinatorId || cell.officerId);
  if (coordinatorRef) {
    user = await User.findOne({ id: coordinatorRef, role: 'coordinator' }).lean();
  }
  if (!user) {
    user = await User.findOne({
      role: 'coordinator',
      email: new RegExp(`^${escapeRegex(id)}$`, 'i'),
    }).lean();
  }

  // Uniform error — never reveal which part was wrong.
  if (!user || user.isDeleted) throw new ApiError(401, 'Invalid credentials.');
  if (user.status && user.status !== 'active') {
    throw new ApiError(403, 'Your account has been deactivated. Contact administration.');
  }
  const ok = await comparePassword(String(password), user.passwordHash);
  if (!ok) throw new ApiError(401, 'Invalid credentials.');

  const resolvedCell = cell || (await Cell.findOne({ coordinatorId: user.id }).lean());
  return toSession(user, resolvedCell);
}

/** Current coordinator session (for /auth/me). */
async function getProfile(userId) {
  const { user, cell } = await loadCoordinator(userId);
  return toSession(user, cell);
}

module.exports = { login, getProfile, toSession };
