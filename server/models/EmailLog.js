const { Schema, model, models } = require('mongoose');

/**
 * emailLogs collection — a shared audit trail of every lifecycle email sent by
 * any portal. Each portal appends its own rows; nobody mutates another's.
 *
 * strict:false so the document can carry portal-specific extras, and `template`
 * has NO enum so any current/future template id is accepted without a schema
 * change. Never used to gate a business action — pure record-keeping.
 */
const emailLogSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    recipient: { type: String, default: '', index: true },
    recipientName: { type: String, default: '' },
    applicationId: { type: String, default: '', index: true },
    template: { type: String, default: '' }, // no enum — any template id accepted
    subject: { type: String, default: '' },
    sentBy: { type: String, default: 'system' },
    sentByName: { type: String, default: 'System' },
    sentAt: { type: String },
    deliveryStatus: { type: String, default: 'failed' }, // 'sent' | 'failed'
    previewUrl: { type: String, default: null },
    error: { type: String, default: null },
    provider: { type: String, default: '' },
    messageId: { type: String, default: null },
    retryCount: { type: Number, default: 0 },
  },
  { versionKey: false, strict: false }
);

module.exports = models.EmailLog || model('EmailLog', emailLogSchema, 'emailLogs');
