const Training = require('../models/Training');
const Application = require('../models/Application');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const { recordAudit } = require('./auditService');
const { generateAttendanceForm, readDocument } = require('./documentService');
const { sendTemplateEmail } = require('./email/mailer');
const { loadCoordinator, cellKeys } = require('../utils/identity');
const { validateTrainingInput, validateEvaluation } = require('../utils/validation');

function genId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}
const now = () => new Date().toISOString();

/** Resolve the coordinator + the cell identifiers that scope their data. */
async function scope(userId) {
  const { user, cell } = await loadCoordinator(userId);
  const keys = cellKeys(cell, user);
  if (keys.length === 0) throw new ApiError(403, 'No cell is assigned to this coordinator.');
  return { user, cell, keys };
}

/**
 * Emit a cross-portal business event. The trainings document state change IS the
 * event transport (consumed by the TEC Workflow Service via the trainings change
 * stream, which projects applications.status). The Coordinator NEVER writes the
 * applications collection. We also record the event in the shared audit log.
 */
async function emitEvent(action, training, actor) {
  logger.info('event_emitted', {
    event: action,
    trainingId: training.id,
    applicationId: training.applicationId,
    status: training.status,
  });
  await recordAudit({
    action,
    userId: actor.userId,
    userName: actor.userName,
    entity: 'training',
    entityId: training.id,
    ip: actor.ip,
    meta: { applicationId: training.applicationId, studentId: training.studentId, status: training.status },
  });
}

async function notifyStudent(training, title, message) {
  await Notification.create({
    id: genId('NT'),
    recipientId: training.studentId,
    studentId: training.studentId,
    assignedCellId: training.assignedCellId,
    type: 'success',
    title,
    message,
    read: false,
    createdAt: now(),
  }).catch(() => undefined);
}

/**
 * Best-effort lifecycle email to the STUDENT tied to a training. Fire-and-forget:
 * never awaited on the request path, never throws, never blocks the business
 * action. Looks up the Student doc (same pattern as generateAttendance) to
 * resolve the recipient email + display name, then renders + sends the template.
 *
 * @param {object} training  the training document (id/studentId/module/schedule)
 * @param {string} template  lifecycle template id (e.g. 'training_started')
 * @param {object} [opts]    { attachAttendanceForm?: boolean }
 */
function emailStudentAboutTraining(training, template, opts = {}) {
  // Fire-and-forget: kick off async work and swallow any error.
  (async () => {
    try {
      const student = await Student.findOne({
        $or: [{ id: training.studentId }, { studentId: training.studentId }],
      }).lean();
      const to = student && student.email;
      if (!to) return; // no address on file — nothing to send

      const data = {
        name: (student && (student.studentName || student.name)) || '',
        trainingModule: training.trainingModule,
        mentorName: training.mentorName,
        reportingLocation: training.reportingLocation,
        reportingTime: training.reportingTime,
        startDate: training.joiningDate || training.startDate,
        duration: training.duration,
      };

      let attachments;
      if (opts.attachAttendanceForm && training.attendanceForm) {
        try {
          const buf = await readDocument(training.attendanceForm);
          attachments = [
            {
              filename: training.attendanceForm.fileName || `attendance_${training.id}.pdf`,
              content: buf,
              contentType: 'application/pdf',
            },
          ];
        } catch (err) {
          // Attachment is optional — send the email without it.
          logger.warn('Attendance form attachment unavailable for email', {
            trainingId: training.id,
            err: err && err.message,
          });
        }
      }

      await sendTemplateEmail({
        to,
        toName: data.name,
        template,
        data,
        attachments,
        applicationId: training.applicationId,
      });
    } catch (err) {
      logger.warn('Lifecycle email failed (non-blocking)', {
        template,
        trainingId: training && training.id,
        err: err && err.message,
      });
    }
  })();
}

async function findScopedTraining(keys, trainingId) {
  const t = await Training.findOne({
    $or: [{ id: trainingId }, { trainingId }],
    assignedCellId: { $in: keys },
  }).lean();
  if (!t) throw new ApiError(404, 'Training not found.');
  return t;
}

// --- Reads --------------------------------------------------------------------

async function listTrainings(userId) {
  const { keys } = await scope(userId);
  return Training.find({ assignedCellId: { $in: keys } }).lean();
}

async function getTraining(userId, trainingId) {
  const { keys } = await scope(userId);
  return findScopedTraining(keys, trainingId);
}

// --- Writes (Coordinator-owned) ----------------------------------------------

/**
 * Create + start a training from the coordinator's assign-mentor/schedule form.
 * Verifies the application is assigned to this coordinator's cell.
 */
async function createAndStart(userId, payload, actor) {
  const { keys } = await scope(userId);
  const input = validateTrainingInput(payload);
  const applicationId = payload.applicationId;
  const studentId = payload.studentId;
  if (!applicationId || !studentId) throw new ApiError(400, 'applicationId and studentId are required.');

  const app = await Application.findOne({
    $or: [{ id: applicationId }, { applicationId }],
    assignedCellId: { $in: keys },
  }).lean();
  if (!app) throw new ApiError(403, 'This application is not assigned to your cell.');

  const existing = await Training.findOne({ applicationId, assignedCellId: { $in: keys } }).lean();
  if (existing) throw new ApiError(409, 'A training already exists for this application.');

  const ts = now();
  const id = genId('TRN');
  const doc = {
    id,
    trainingId: id,
    applicationId,
    studentId,
    assignedCellId: app.assignedCellId,
    ...input,
    startDate: input.joiningDate,
    status: 'ACTIVE',
    startedAt: ts,
    createdAt: ts,
    updatedAt: ts,
  };
  await Training.create(doc);
  await emitEvent('TRAINING_STARTED', doc, actor);
  await notifyStudent(doc, 'Training Started', `Your training "${doc.trainingModule}" has started.`);
  emailStudentAboutTraining(doc, 'training_started');
  return doc;
}

/** Start a pre-existing (ASSIGNED) training. */
async function startTraining(userId, trainingId, actor) {
  const { keys } = await scope(userId);
  const t = await findScopedTraining(keys, trainingId);
  if (t.status === 'ACTIVE') return t;
  if (t.status === 'COMPLETED') throw new ApiError(409, 'Training is already completed.');
  await Training.updateOne({ id: t.id }, { $set: { status: 'ACTIVE', startedAt: now(), updatedAt: now() } });
  const updated = { ...t, status: 'ACTIVE' };
  await emitEvent('TRAINING_STARTED', updated, actor);
  await notifyStudent(updated, 'Training Started', `Your training "${t.trainingModule}" has started.`);
  emailStudentAboutTraining(updated, 'training_started');
  return updated;
}

/** Update mentor/schedule/module/location. */
async function updateSchedule(userId, trainingId, payload, actor) {
  const { keys } = await scope(userId);
  const t = await findScopedTraining(keys, trainingId);
  const input = validateTrainingInput(payload, { partial: true });
  if (input.joiningDate) input.startDate = input.joiningDate;
  await Training.updateOne({ id: t.id }, { $set: { ...input, updatedAt: now() } });
  await recordAudit({
    action: 'SCHEDULE_UPDATED',
    userId: actor.userId,
    userName: actor.userName,
    entity: 'training',
    entityId: t.id,
    ip: actor.ip,
    meta: { fields: Object.keys(input) },
  });
  const updated = { ...t, ...input };
  emailStudentAboutTraining(updated, 'training_updated');
  return updated;
}

/** Record the evaluation (embedded) + the fields TEC reads for Ready-To-Join. */
async function submitEvaluation(userId, trainingId, payload, actor) {
  const { keys } = await scope(userId);
  const t = await findScopedTraining(keys, trainingId);
  const e = validateEvaluation(payload);
  const evaluation = {
    evaluationId: genId('EVAL'),
    ...e,
    submittedAt: now(),
  };
  const recommendation = e.overallPerformance >= 6 ? 'Recommended' : 'Not Recommended';
  await Training.updateOne(
    { id: t.id },
    {
      $set: {
        evaluation,
        feedback: e.remarks,
        remarks: e.remarks,
        performance: String(e.overallPerformance),
        recommendation,
        attendance: t.attendance || 100,
        updatedAt: now(),
      },
    }
  );
  await recordAudit({
    action: 'EVALUATION_SUBMITTED',
    userId: actor.userId,
    userName: actor.userName,
    entity: 'training',
    entityId: t.id,
    ip: actor.ip,
  });
  return { ...t, evaluation };
}

/** Complete the training → emits training.completed (TEC projects app status). */
async function completeTraining(userId, trainingId, actor) {
  const { keys } = await scope(userId);
  const t = await findScopedTraining(keys, trainingId);
  if (t.status === 'COMPLETED') return t;
  const patch = {
    status: 'COMPLETED',
    completedAt: now(),
    attendance: t.attendance || 100,
    updatedAt: now(),
  };
  await Training.updateOne({ id: t.id }, { $set: patch });
  const updated = { ...t, ...patch };
  await emitEvent('TRAINING_COMPLETED', updated, actor);
  await notifyStudent(updated, 'Training Completed', `Your training "${t.trainingModule}" has been completed.`);
  emailStudentAboutTraining(updated, 'training_completed', { attachAttendanceForm: true });
  return updated;
}

/** Generate + store the Attendance Form reference (metadata only). */
async function generateAttendance(userId, trainingId, actor) {
  const { keys } = await scope(userId);
  const t = await findScopedTraining(keys, trainingId);
  const student = await Student.findOne({
    $or: [{ id: t.studentId }, { studentId: t.studentId }],
  }).lean();
  const ref = await generateAttendanceForm(t, student, actor.userId);
  await Training.updateOne({ id: t.id }, { $set: { attendanceForm: ref, updatedAt: now() } });
  await recordAudit({
    action: 'ATTENDANCE_GENERATED',
    userId: actor.userId,
    userName: actor.userName,
    entity: 'training',
    entityId: t.id,
    ip: actor.ip,
  });
  return ref;
}

module.exports = {
  scope,
  listTrainings,
  getTraining,
  createAndStart,
  startTraining,
  updateSchedule,
  submitEvaluation,
  completeTraining,
  generateAttendance,
};
