const User = require('../models/User');
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
    // Phone captured by Admin at account creation (users.phone).
    coordinatorContact: user.phone || '',
    department: sc.department,
    role: 'coordinator',
    isAuthenticated: true,
    loginTime: new Date().toISOString(),
  };
}

/**
 * Coordinator login — EMAIL + password against the Admin-created coordinator
 * account (users, role 'coordinator', department = one of the 78 admin
 * departments). The legacy cell-login is retired.
 */
async function login(identifier, password) {
  if (!identifier || !password) throw new ApiError(400, 'Email and password are required.');
  const id = String(identifier).trim();

  const user = await User.findOne({
    role: 'coordinator',
    email: new RegExp(`^${escapeRegex(id)}$`, 'i'),
  }).lean();

  // Uniform error — never reveal which part was wrong.
  if (!user || user.isDeleted) throw new ApiError(401, 'Invalid credentials.');
  if (user.status && user.status !== 'active') {
    throw new ApiError(403, 'Your account has been deactivated. Contact administration.');
  }
  const ok = await comparePassword(String(password), user.passwordHash);
  if (!ok) throw new ApiError(401, 'Invalid credentials.');

  return toSession(user, null);
}

/** Current coordinator session (for /auth/me). */
async function getProfile(userId) {
  const { user, cell } = await loadCoordinator(userId);
  return toSession(user, cell);
}

module.exports = { login, getProfile, toSession };
