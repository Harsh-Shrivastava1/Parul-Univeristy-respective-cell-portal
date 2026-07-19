const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Application = require('../models/Application');
const Student = require('../models/Student');
const Training = require('../models/Training');
const { scope } = require('../services/trainingService');
const { toStudent, toApplication } = require('../utils/mappers');

/** Applications assigned to the coordinator's cell + their trainings. */
async function loadCellApplications(userId) {
  const { keys } = await scope(userId);
  const apps = await Application.find({ assignedCellId: { $in: keys } }).lean();
  const appIds = apps.map((a) => a.id || a.applicationId).filter(Boolean);
  const trainings = appIds.length
    ? await Training.find({ applicationId: { $in: appIds } }).lean()
    : [];
  const trainingByApp = new Map(trainings.map((t) => [t.applicationId, t]));
  return { apps, trainingByApp };
}

// GET /api/me/students — assigned students (read gateway; Student-owned data)
const listAssignedStudents = asyncHandler(async (req, res) => {
  const { apps } = await loadCellApplications(req.user.sub);
  const studentIds = [...new Set(apps.map((a) => a.studentId || a.userId).filter(Boolean))];
  const students = studentIds.length
    ? await Student.find({ $or: [{ id: { $in: studentIds } }, { studentId: { $in: studentIds } }] }).lean()
    : [];
  res.json({ success: true, data: students.map(toStudent).filter(Boolean) });
});

// GET /api/students/:studentId — one assigned student
const getStudent = asyncHandler(async (req, res) => {
  const { apps } = await loadCellApplications(req.user.sub);
  const sid = req.params.studentId;
  const inCell = apps.some((a) => a.studentId === sid || a.userId === sid);
  if (!inCell) throw new ApiError(404, 'Student not found in your cell.');
  const student = await Student.findOne({ $or: [{ id: sid }, { studentId: sid }] }).lean();
  if (!student) throw new ApiError(404, 'Student not found.');
  res.json({ success: true, data: toStudent(student) });
});

// GET /api/me/applications — cell applications (derived coordinator status)
const listApplications = asyncHandler(async (req, res) => {
  const { apps, trainingByApp } = await loadCellApplications(req.user.sub);
  const data = apps.map((a) => toApplication(a, trainingByApp.get(a.id || a.applicationId)));
  res.json({ success: true, data });
});

// GET /api/applications/:id — one cell application
const getApplication = asyncHandler(async (req, res) => {
  const { apps, trainingByApp } = await loadCellApplications(req.user.sub);
  const app = apps.find((a) => a.id === req.params.id || a.applicationId === req.params.id);
  if (!app) throw new ApiError(404, 'Application not found in your cell.');
  res.json({ success: true, data: toApplication(app, trainingByApp.get(app.id || app.applicationId)) });
});

module.exports = { listAssignedStudents, getStudent, listApplications, getApplication };
