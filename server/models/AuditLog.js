const { Schema, model, models } = require('mongoose');

/**
 * auditLogs collection — single SHARED, append-only audit trail across portals.
 * strict:false so the Coordinator Portal records its own action vocabulary
 * (AUTH_LOGIN, TRAINING_STARTED, TRAINING_COMPLETED, EVALUATION_SUBMITTED,
 * ATTENDANCE_GENERATED, SCHEDULE_UPDATED, ...).
 */
const auditSchema = new Schema({}, { versionKey: false, strict: false });

module.exports = models.AuditLog || model('AuditLog', auditSchema, 'auditLogs');
