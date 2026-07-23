const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Application = require('../models/Application');
const Training = require('../models/Training');
const Notification = require('../models/Notification');
const { loadCoordinator, cellKeys } = require('../utils/identity');
const { recordAudit } = require('../services/auditService');
const { sendTemplateEmail } = require('../services/email/mailer');
const { clientIp } = require('../utils/http');
const crypto = require('crypto');

const genId = (prefix) => `${prefix}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
const now = () => new Date().toISOString();

/**
 * Department coordinator command-writes on the applications collection.
 *
 * Reject / Terminate are the two sanctioned exceptions to the "TEC owns
 * applications" single-writer rule: they are explicit, validated commands whose
 * status values ("Rejected by Department" / "Terminated") the TEC projector
 * never clobbers. Everything else about applications remains TEC-owned.
 *
 * Rules (per college requirements):
 *  - Reject: before the student JOINS — after arrival, during ongoing training,
 *    or after training. Status → "Rejected by Department"; app closed; the
 *    student stays free to apply to other ads. Reason mandatory.
 *    Notify: student + TEC.
 *  - Terminate: only after the student has JOINED. Status → "Terminated".
 *    Reason mandatory. Notify: student + TEC (+ this department itself acted).
 */

const TEC_INBOX = process.env.TEC_NOTIFY_EMAIL || 'collegepurposeparul@gmail.com';
const REJECTABLE = ['Selected For Training', 'Training In Progress', 'Training Completed'];

async function loadScopedApplication(userId, appId) {
  const { user } = await loadCoordinator(userId);
  const keys = cellKeys(null, user);
  if (!keys.length) throw new ApiError(403, 'No department is assigned to this coordinator.');
  const app = await Application.findOne({
    $or: [{ id: appId }, { applicationId: appId }],
    assignedDepartment: { $in: keys },
  }).lean();
  if (!app) throw new ApiError(403, 'This application is not assigned to your department.');
  return { user, app };
}

function timelineEntry(type, title, description, by, remarks, prev, next) {
  return {
    id: genId('TL'),
    at: now(),
    type,
    title,
    description,
    by,
    role: 'coordinator',
    remarks: remarks || '',
    previousStatus: prev || '',
    currentStatus: next || '',
    metadata: {},
  };
}

async function notifyTec(title, message, appId) {
  // TEC portal's notification feed reads the shared notifications collection.
  await Notification.create({
    id: genId('NT'),
    type: 'system',
    title,
    message,
    applicationId: appId,
    read: false,
    isRead: false,
    createdAt: now(),
  });
}

async function notifyStudentDoc(app, title, message) {
  await Notification.create({
    id: genId('NT'),
    recipientId: app.studentId,
    studentId: app.studentId,
    type: 'warning',
    title,
    message,
    read: false,
    isRead: false,
    createdAt: now(),
  });
}

// POST /api/me/applications/:id/reject  { reason }
const reject = asyncHandler(async (req, res) => {
  const reason = String((req.body || {}).reason || '').trim();
  if (reason.length < 3) throw new ApiError(400, 'A rejection reason is required.');

  const { user, app } = await loadScopedApplication(req.user.sub, req.params.id);
  if (app.status === 'Rejected by Department') return res.json({ success: true, data: { status: app.status } });
  if (!REJECTABLE.includes(app.status)) {
    throw new ApiError(400, `Only students before joining can be rejected (current status: ${app.status}).`);
  }

  const ts = now();
  const rejection = { reason, detail: reason, rejectedAt: ts, rejectedBy: user.id, byDepartment: user.department };
  await Application.updateOne(
    { id: app.id },
    {
      $set: { status: 'Rejected by Department', rejection, updatedAt: ts },
      $push: {
        timeline: timelineEntry(
          'department_rejected',
          'Rejected by Department',
          `${user.department} rejected the student. Reason: ${reason}`,
          user.id,
          reason,
          app.status,
          'Rejected by Department',
        ),
      },
    },
  );
  // An in-flight training (if any) is cancelled — the projector ignores CANCELLED.
  await Training.updateMany(
    { applicationId: app.id, status: { $in: ['ACTIVE', 'PENDING'] } },
    { $set: { status: 'CANCELLED', updatedAt: ts } },
  );

  await recordAudit({
    action: 'APPLICATION_REJECTED_BY_DEPARTMENT',
    userId: user.id,
    userName: user.name,
    entity: 'application',
    entityId: app.id,
    ip: clientIp(req),
    meta: { reason, department: user.department, previousStatus: app.status },
  });
  await notifyStudentDoc(app, 'Application update', `Your internship application was rejected by the ${user.department} department. Reason: ${reason}`);
  await notifyTec('Student rejected by department', `${app.studentName} was rejected by ${user.department}. Reason: ${reason}`, app.id);

  // Emails — student + TEC (best-effort).
  const data = { name: app.studentName, role: app.advertisementTitle, department: user.department, reason };
  sendTemplateEmail({ to: app.email, toName: app.studentName, template: 'department_rejected', data }).catch(() => {});
  sendTemplateEmail({ to: TEC_INBOX, toName: 'Internship Cell', template: 'department_rejected', data: { ...data, name: 'Internship Cell' } }).catch(() => {});

  res.json({ success: true, data: { status: 'Rejected by Department' } });
});

// POST /api/me/applications/:id/terminate  { reason }
const terminate = asyncHandler(async (req, res) => {
  const reason = String((req.body || {}).reason || '').trim();
  if (reason.length < 3) throw new ApiError(400, 'A termination reason is required.');

  const { user, app } = await loadScopedApplication(req.user.sub, req.params.id);
  if (app.status === 'Terminated') return res.json({ success: true, data: { status: app.status } });
  if (app.status !== 'Joined') {
    throw new ApiError(400, `Only joined internships can be terminated (current status: ${app.status}).`);
  }

  const ts = now();
  const termination = { reason, terminatedAt: ts, terminatedBy: user.id, byRole: 'coordinator', byDepartment: user.department };
  await Application.updateOne(
    { id: app.id },
    {
      $set: { status: 'Terminated', termination, updatedAt: ts },
      $push: {
        timeline: timelineEntry(
          'terminated',
          'Terminated',
          `Internship terminated by ${user.department}. Reason: ${reason}`,
          user.id,
          reason,
          app.status,
          'Terminated',
        ),
      },
    },
  );

  await recordAudit({
    action: 'APPLICATION_TERMINATED',
    userId: user.id,
    userName: user.name,
    entity: 'application',
    entityId: app.id,
    ip: clientIp(req),
    meta: { reason, department: user.department },
  });
  await notifyStudentDoc(app, 'Internship terminated', `Your internship was terminated by the ${user.department} department. Reason: ${reason}`);
  await notifyTec('Internship terminated', `${app.studentName}'s internship was terminated by ${user.department}. Reason: ${reason}`, app.id);

  const data = { name: app.studentName, role: app.advertisementTitle, department: user.department, terminatedBy: user.department, reason };
  sendTemplateEmail({ to: app.email, toName: app.studentName, template: 'terminated', data }).catch(() => {});
  sendTemplateEmail({ to: TEC_INBOX, toName: 'Internship Cell', template: 'terminated', data: { ...data, name: 'Internship Cell' } }).catch(() => {});

  res.json({ success: true, data: { status: 'Terminated' } });
});

// POST /api/me/applications/:id/complete-internship  { remarks }
// Third sanctioned command-write: mark a JOINED internship as successfully
// completed. Whichever side (TEC or department) completes first, the student,
// TEC and the coordinator are all informed. Certificate is issued PHYSICALLY
// by the TEC office — no digital issuance.
const completeInternship = asyncHandler(async (req, res) => {
  const remarks = String((req.body || {}).remarks || '').trim();
  if (remarks.length < 3) throw new ApiError(400, 'Completion remarks are required.');

  const { user, app } = await loadScopedApplication(req.user.sub, req.params.id);
  if (app.status === 'Internship Completed') return res.json({ success: true, data: { status: app.status } });
  if (app.status !== 'Joined') {
    throw new ApiError(400, `Only joined internships can be marked completed (current status: ${app.status}).`);
  }

  const ts = now();
  const internshipCompletion = { remarks, completedAt: ts, completedBy: user.id, byRole: 'coordinator', byDepartment: user.department };
  await Application.updateOne(
    { id: app.id },
    {
      $set: { status: 'Internship Completed', internshipCompletion, updatedAt: ts },
      $push: {
        timeline: timelineEntry(
          'internship_completed',
          'Internship Completed',
          `Internship completed — marked by ${user.department}. Remarks: ${remarks}`,
          user.id,
          remarks,
          app.status,
          'Internship Completed',
        ),
      },
    },
  );

  await recordAudit({
    action: 'APPLICATION_INTERNSHIP_COMPLETED',
    userId: user.id,
    userName: user.name,
    entity: 'application',
    entityId: app.id,
    ip: clientIp(req),
    meta: { remarks, department: user.department },
  });
  await notifyStudentDoc(app, 'Internship completed', `Congratulations! Your internship was marked completed by the ${user.department} department. Collect your certificate from the Internship Cell office.`);
  await notifyTec('Internship completed', `${app.studentName}'s internship was marked completed by ${user.department}. Remarks: ${remarks}`, app.id);

  const data = { name: app.studentName, role: app.advertisementTitle, department: user.department, completedBy: user.department, remarks };
  sendTemplateEmail({ to: app.email, toName: app.studentName, template: 'internship_completed', data }).catch(() => {});
  sendTemplateEmail({ to: TEC_INBOX, toName: 'Internship Cell', template: 'internship_completed', data: { ...data, name: 'Internship Cell' } }).catch(() => {});

  res.json({ success: true, data: { status: 'Internship Completed' } });
});

module.exports = { reject, terminate, completeInternship };
