const { Router } = require('express');
const { env } = require('../config/env');
const { sendTemplateEmail } = require('../services/email/mailer');

/**
 * DEV-ONLY email test routes. Mounted ONLY when NODE_ENV !== 'production'
 * (see routes/index.js). Lets you verify SMTP + template rendering end-to-end.
 *
 *   POST /api/test/email   body: { "email": "someone@example.com", "template"?: "welcome" }
 */
const router = Router();

router.post('/email', async (req, res) => {
  const email = String((req.body && req.body.email) || '').trim();
  const template = String((req.body && req.body.template) || 'welcome');
  if (!email) {
    res.status(400).json({ success: false, error: 'email is required' });
    return;
  }

  const started = Date.now();
  const log = await sendTemplateEmail({
    to: email,
    toName: 'Test Recipient',
    template,
    data: {
      name: 'Test Recipient',
      email,
      department: 'Computer Science & Engineering',
      enrollmentNumber: 'TEST-0001',
      role: 'Software Engineering Intern',
      company: 'Acme Corp',
      loginUrl: env.frontendOrigins[0],
    },
  });
  const timingMs = Date.now() - started;

  res.json({
    success: log.deliveryStatus === 'sent',
    status: log.deliveryStatus,
    provider: log.provider,
    messageId: log.messageId,
    previewUrl: log.previewUrl || null,
    timingMs,
    error: log.error,
    logId: log.id,
  });
});

module.exports = router;
