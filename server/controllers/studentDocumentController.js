const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Training = require('../models/Training');
const User = require('../models/User');
const { readDocument } = require('../services/documentService');

/**
 * GET /api/student/attendance-form/:applicationId  (student-authenticated)
 * Streams the Attendance Form the Coordinator generated for THIS student's
 * training. Ownership-preserving: the Coordinator generated + stored the file;
 * the student only downloads their own. No document generation happens here.
 */
const downloadAttendanceForm = asyncHandler(async (req, res) => {
  if (!req.studentAuth) throw new ApiError(401, 'Not authenticated.');
  const sub = req.studentAuth.sub;
  const user = await User.findOne({ id: sub }).lean();
  const candidates = [sub, user && user.studentId].filter(Boolean);

  const applicationId = req.params.applicationId;
  const training = await Training.findOne({
    $or: [{ applicationId }, { id: applicationId }],
    studentId: { $in: candidates },
  }).lean();
  if (!training) throw new ApiError(404, 'Attendance form not found.');

  const ref = training.attendanceForm;
  if (!ref) throw new ApiError(404, 'Attendance form is not available yet.');

  const buffer = await readDocument(ref);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${ref.fileName}"`);
  res.send(buffer);
});

module.exports = { downloadAttendanceForm };
