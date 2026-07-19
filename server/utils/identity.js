const User = require('../models/User');
const Cell = require('../models/Cell');
const ApiError = require('./ApiError');

/**
 * Load the authenticated coordinator (users, role=coordinator) and resolve the
 * cell they manage (cells.coordinatorId === user.id, or by department).
 */
async function loadCoordinator(userId) {
  const user = await User.findOne({ id: userId, role: 'coordinator' }).lean();
  if (!user) throw new ApiError(404, 'Coordinator account not found.');
  let cell = await Cell.findOne({ coordinatorId: user.id }).lean();
  if (!cell && user.department) {
    cell = await Cell.findOne({
      $or: [{ department: user.department }, { departments: user.department }],
    }).lean();
  }
  return { user, cell };
}

/** The identifiers an application/training may use to reference this cell. */
function cellKeys(cell, user) {
  const keys = new Set();
  [cell && cell.id, cell && cell.cellId, cell && cell._id && String(cell._id), user && user.cellId].forEach(
    (k) => {
      if (k) keys.add(String(k));
    }
  );
  return Array.from(keys);
}

/** Public cell identity for the auth session / frontend. */
function sessionCell(cell, user) {
  return {
    cellId: (cell && (cell.cellId || cell.id)) || 'cell',
    cellName: (cell && (cell.cellName || cell.name)) || (user && user.department) || 'Cell',
    department: (cell && cell.department) || (user && user.department) || '',
  };
}

module.exports = { loadCoordinator, cellKeys, sessionCell };
