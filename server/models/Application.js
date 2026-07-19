const { Schema, model, models } = require('mongoose');

/**
 * applications collection — shared, owned by the TEC Cell Portal.
 * The Coordinator Portal READS applications assigned to its cell only. It NEVER
 * writes this collection — application workflow status is projected by the TEC
 * backend in response to training events.
 */
const applicationSchema = new Schema({}, { versionKey: false, strict: false });

module.exports = models.Application || model('Application', applicationSchema, 'applications');
