const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const trainingService = require('../services/trainingService');
const { readDocument } = require('../services/documentService');
const { clientIp } = require('../utils/http');
const { toTraining, toEvaluation } = require('../utils/mappers');

const actorOf = (req) => ({ userId: req.user.sub, userName: req.user.name, ip: clientIp(req) });

// GET /api/me/trainings
const list = asyncHandler(async (req, res) => {
  const trainings = await trainingService.listTrainings(req.user.sub);
  res.json({ success: true, data: trainings.map(toTraining) });
});

// GET /api/me/evaluations — evaluations from the cell's trainings
const listEvaluations = asyncHandler(async (req, res) => {
  const trainings = await trainingService.listTrainings(req.user.sub);
  res.json({ success: true, data: trainings.map(toEvaluation).filter(Boolean) });
});

// GET /api/trainings/:id
const getOne = asyncHandler(async (req, res) => {
  const t = await trainingService.getTraining(req.user.sub, req.params.id);
  res.json({ success: true, data: toTraining(t) });
});

// POST /api/trainings — create + start (assign mentor/schedule then start)
const create = asyncHandler(async (req, res) => {
  const t = await trainingService.createAndStart(req.user.sub, req.body || {}, actorOf(req));
  res.status(201).json({ success: true, data: toTraining(t) });
});

// PATCH /api/trainings/:id — update mentor/schedule
const update = asyncHandler(async (req, res) => {
  const t = await trainingService.updateSchedule(req.user.sub, req.params.id, req.body || {}, actorOf(req));
  res.json({ success: true, data: toTraining(t) });
});

// POST /api/trainings/:id/start
const start = asyncHandler(async (req, res) => {
  const t = await trainingService.startTraining(req.user.sub, req.params.id, actorOf(req));
  res.json({ success: true, data: toTraining(t) });
});

// POST /api/trainings/:id/complete
const complete = asyncHandler(async (req, res) => {
  const t = await trainingService.completeTraining(req.user.sub, req.params.id, actorOf(req));
  res.json({ success: true, data: toTraining(t) });
});

// POST /api/trainings/:id/evaluation
const evaluation = asyncHandler(async (req, res) => {
  const t = await trainingService.submitEvaluation(req.user.sub, req.params.id, req.body || {}, actorOf(req));
  res.status(201).json({ success: true, data: toEvaluation(t) });
});

// POST /api/trainings/:id/attendance-form — generate
const generateAttendance = asyncHandler(async (req, res) => {
  const ref = await trainingService.generateAttendance(req.user.sub, req.params.id, actorOf(req));
  res.status(201).json({ success: true, data: { fileName: ref.fileName, generatedAt: ref.generatedAt } });
});

// GET /api/trainings/:id/attendance-form — download
const downloadAttendance = asyncHandler(async (req, res) => {
  const t = await trainingService.getTraining(req.user.sub, req.params.id);
  const ref = t.attendanceForm;
  if (!ref) throw new ApiError(404, 'Attendance form not generated yet.');
  const buffer = await readDocument(ref);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${ref.fileName}"`);
  res.send(buffer);
});

module.exports = { list, listEvaluations, getOne, create, update, start, complete, evaluation, generateAttendance, downloadAttendance };
