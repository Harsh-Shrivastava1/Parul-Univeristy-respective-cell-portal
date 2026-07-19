const { Schema, model, models } = require('mongoose');

/**
 * notifications collection — single SHARED model across all portals.
 * The Coordinator creates notifications here (e.g. for the assigned student /
 * TEC) using the shared shape. strict:false preserves cross-portal fields.
 */
const notificationSchema = new Schema({}, { versionKey: false, strict: false });

module.exports = models.Notification || model('Notification', notificationSchema, 'notifications');
