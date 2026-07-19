const { Schema, model, models } = require('mongoose');

/**
 * users collection — shared, owned by the Admin Portal.
 * The Coordinator Portal READS it only to authenticate Admin-created
 * coordinator accounts (role === 'coordinator'). strict:false so lean reads
 * return passwordHash and any sibling fields (department, cellId, etc.).
 */
const userSchema = new Schema(
  {
    id: { type: String, index: true },
    name: String,
    email: { type: String, index: true },
    role: { type: String, index: true },
    department: String,
    status: String,
    passwordHash: String,
  },
  { versionKey: false, strict: false }
);

module.exports = models.User || model('User', userSchema, 'users');
