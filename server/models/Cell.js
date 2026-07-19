const { Schema, model, models } = require('mongoose');

/**
 * cells collection — shared, owned by the Admin Portal.
 * The Coordinator Portal READS it only to resolve the signed-in coordinator's
 * cell (which scopes the trainings/applications they may see). strict:false
 * preserves the sibling document shape (cellId/cellName/loginId/etc.).
 */
const cellSchema = new Schema(
  {
    id: { type: String, index: true },
    name: String,
    officerId: String,
    coordinatorId: { type: String, index: true },
    coordinatorName: String,
    departments: [String],
    department: String,
    status: String,
  },
  { versionKey: false, strict: false }
);

module.exports = models.Cell || model('Cell', cellSchema, 'cells');
