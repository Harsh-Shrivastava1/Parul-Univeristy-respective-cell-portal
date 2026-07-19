/**
 * Translators from shared MongoDB documents into the exact TypeScript shapes the
 * existing Coordinator frontend consumes (`src/types/index.ts`). Keeping these
 * here means the frontend pages never change.
 */

// students (Student Portal) → frontend Student
function toStudent(s) {
  if (!s) return null;
  return {
    studentId: s.studentId || s.id || '',
    name: s.studentName || s.name || '',
    enrollmentNumber: s.enrollmentNumber || '',
    email: s.email || '',
    phone: s.contactNumber || s.phone || '',
    contact: s.contactNumber || s.contact || '',
    department: s.department || '',
    semester: Number(s.semester || 0),
    assignedCompany: s.assignedCompany || '',
    assignedMentor: s.assignedMentor || undefined,
    avatar: s.avatar || undefined,
  };
}

// trainings (Coordinator) → frontend Training
function toTraining(t) {
  if (!t) return null;
  return {
    trainingId: t.trainingId || t.id || '',
    applicationId: t.applicationId || '',
    studentId: t.studentId || '',
    assignedCellId: t.assignedCellId || '',
    mentorName: t.mentorName || '',
    companySupervisor: t.companySupervisor || '',
    trainingModule: t.trainingModule || '',
    reportingLocation: t.reportingLocation || '',
    joiningDate: t.joiningDate || t.startDate || '',
    reportingTime: t.reportingTime || '',
    duration: Number(t.duration || 0),
    status: t.status || 'ASSIGNED',
  };
}

// Derive the coordinator-facing application status from the owned training.
function deriveStatus(training) {
  const s = training && String(training.status || '').toUpperCase();
  if (s === 'COMPLETED') return 'TRAINING_COMPLETED';
  if (s === 'ACTIVE') return 'TRAINING_ACTIVE';
  return 'ASSIGNED';
}

// applications (TEC) + training → frontend Application (coordinator vocabulary)
function toApplication(app, training) {
  return {
    applicationId: app.id || app.applicationId || '',
    studentId: app.studentId || app.userId || '',
    assignedCellId: app.assignedCellId || '',
    status: deriveStatus(training),
    assignedDate: app.assignedDate || app.appliedDate || app.createdAt || '',
  };
}

// trainings.evaluation → frontend Evaluation
function toEvaluation(t) {
  const e = t && t.evaluation;
  if (!e) return null;
  return {
    evaluationId: e.evaluationId || `EVAL-${t.id}`,
    trainingId: t.trainingId || t.id || '',
    studentId: t.studentId || '',
    applicationId: t.applicationId || '',
    communication: Number(e.communication || 0),
    technicalSkills: Number(e.technicalSkills || 0),
    punctuality: Number(e.punctuality || 0),
    overallPerformance: Number(e.overallPerformance || 0),
    remarks: e.remarks || '',
    submittedAt: e.submittedAt || '',
  };
}

// notifications (shared) → frontend Notification
function toNotification(n, cellId) {
  return {
    notificationId: n.id || n.notificationId || '',
    assignedCellId: n.assignedCellId || cellId || '',
    type: n.type || 'GENERAL',
    title: n.title || '',
    message: n.message || '',
    isRead: !!(n.read || n.isRead),
    createdAt: n.createdAt || '',
  };
}

module.exports = { toStudent, toTraining, toApplication, toEvaluation, toNotification, deriveStatus };
