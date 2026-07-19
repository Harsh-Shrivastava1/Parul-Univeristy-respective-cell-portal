const { Schema, model, models } = require('mongoose');

/**
 * students collection — shared, owned by the Student Portal.
 * The Coordinator Portal READS it only (assigned-student details). Never writes.
 */
const studentSchema = new Schema({}, { versionKey: false, strict: false });

module.exports = models.Student || model('Student', studentSchema, 'students');
