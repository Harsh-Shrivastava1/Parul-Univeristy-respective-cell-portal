const { Schema, model, models } = require('mongoose');

/**
 * trainings collection — OWNED by the Coordinator Portal (the ONLY writer).
 * Holds mentor/schedule/module/location, lifecycle status, the embedded
 * evaluation, and the attendance-form reference (metadata only — the PDF binary
 * lives on disk). strict:false preserves the fields sibling portals (TEC) read
 * for read-time application-status enrichment.
 */
const trainingSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    trainingId: { type: String, index: true },
    applicationId: { type: String, index: true },
    studentId: { type: String, index: true },
    assignedCellId: { type: String, index: true }, // legacy
    assignedDepartment: { type: String, index: true },

    mentorName: { type: String, default: '' },
    companySupervisor: { type: String, default: '' },
    trainingModule: { type: String, default: '' },
    reportingLocation: { type: String, default: '' },
    joiningDate: { type: String, default: '' },
    startDate: { type: String, default: '' }, // mirrors joiningDate for sibling reads
    reportingTime: { type: String, default: '' },
    duration: { type: Number, default: 0 },

    // ASSIGNED | ACTIVE | COMPLETED
    status: { type: String, default: 'ASSIGNED', index: true },
    startedAt: { type: String, default: null },
    completedAt: { type: String, default: null },

    // Embedded evaluation (set on completion)
    evaluation: { type: Schema.Types.Mixed, default: null },
    // Fields sibling portals (TEC) read to gate Ready-To-Join
    feedback: { type: String, default: '' },
    performance: { type: String, default: '' },
    remarks: { type: String, default: '' },
    recommendation: { type: String, default: '' },
    attendance: { type: Number, default: 0 },

    // Attendance form reference (metadata only)
    attendanceForm: { type: Schema.Types.Mixed, default: null },

    createdAt: { type: String },
    updatedAt: { type: String },
  },
  { versionKey: false, strict: false }
);
trainingSchema.index({ assignedDepartment: 1, status: 1 });

module.exports = models.Training || model('Training', trainingSchema, 'trainings');
