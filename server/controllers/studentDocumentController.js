const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Training = require('../models/Training');
const User = require('../models/User');
const Student = require('../models/Student');
const Application = require('../models/Application');
const { readDocument, buildTrainingApplicationForm, fmtDate } = require('../services/documentService');

/** Add N weeks to an ISO date, returning YYYY-MM-DD (or '' if not computable). */
function addWeeks(iso, weeks) {
  if (!iso || !weeks) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + Number(weeks) * 7);
  return d.toISOString().slice(0, 10);
}

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

/**
 * GET /api/student/training-application/:applicationId  (student-authenticated)
 * Generates the filled "Internship Training Application" letter for THIS
 * student's training and streams it as a PDF. Available once a training exists
 * for the application (i.e. the cell has started the training).
 */
const downloadTrainingApplication = asyncHandler(async (req, res) => {
  if (!req.studentAuth) throw new ApiError(401, 'Not authenticated.');
  const sub = req.studentAuth.sub;
  const user = await User.findOne({ id: sub }).lean();
  const candidates = [sub, user && user.studentId].filter(Boolean);
  const applicationId = req.params.applicationId;

  const training = await Training.findOne({
    $or: [{ applicationId }, { id: applicationId }],
    studentId: { $in: candidates },
  }).lean();
  if (!training) throw new ApiError(404, 'Training not found for this application.');

  const student = await Student.findOne({
    $or: [{ id: training.studentId }, { studentId: training.studentId }, { userId: sub }],
  }).lean();
  const application = await Application.findOne({
    $or: [{ id: training.applicationId }, { applicationId: training.applicationId }],
  }).lean();

  const fromIso = training.joiningDate || training.startDate || '';
  const toIso = addWeeks(fromIso, training.duration);

  const internshipDepartment =
    (application && application.assignedDepartment) ||
    (training && training.assignedDepartment) ||
    (training && training.reportingLocation) ||
    (application && (application.department || (application.formData && application.formData.departmentName))) ||
    (training && training.trainingModule) ||
    'Training Department';

  const pdfBytes = await buildTrainingApplicationForm({
    name: (student && (student.studentName || student.name)) || (application && application.studentName) || req.studentAuth.name,
    enrollmentNumber: (student && student.enrollmentNumber) || (application && application.enrollmentNumber),
    program: (student && student.department) || (application && (application.department || (application.formData && application.formData.departmentName))),
    semester: student ? student.semester : '',
    internshipAt: internshipDepartment,
    fromDate: fromIso ? fmtDate(fromIso) : '',
    toDate: toIso ? fmtDate(toIso) : '',
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="Training_Application_${training.id}.pdf"`);
  res.send(Buffer.from(pdfBytes));
});

module.exports = { downloadAttendanceForm, downloadTrainingApplication };
