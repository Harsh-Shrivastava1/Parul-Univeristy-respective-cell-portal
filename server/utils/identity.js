const User = require('../models/User');
const ApiError = require('./ApiError');

/**
 * DEPARTMENT-BASED coordinator identity (the "cell" concept is retired).
 *
 * A coordinator is an Admin-created user (role 'coordinator') tied to exactly
 * ONE administrative department (users.department — one of the 78 from the
 * college sheet). Everything the portal shows is scoped by that department:
 * applications routed via `assignedDepartment`, trainings, notifications.
 *
 * The exported names keep their historical signatures (cellKeys/sessionCell)
 * so call sites stay unchanged — the keys are now department names.
 */
async function loadCoordinator(userId) {
  const user = await User.findOne({ id: userId, role: 'coordinator' }).lean();
  if (!user) throw new ApiError(404, 'Coordinator account not found.');
  return { user, cell: null };
}

/** Scoping keys — the coordinator's department name. */
function cellKeys(_cell, user) {
  const dept = user && user.department;
  return dept ? [String(dept)] : [];
}

/** Public identity for the auth session / frontend. */
function sessionCell(_cell, user) {
  const dept = (user && user.department) || '';
  return {
    cellId: dept || 'department',
    cellName: dept || 'Department',
    department: dept,
  };
}

module.exports = { loadCoordinator, cellKeys, sessionCell };
