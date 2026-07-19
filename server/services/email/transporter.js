const nodemailer = require('nodemailer');
const { env } = require('../../config/env');
const logger = require('../../config/logger');

/**
 * Nodemailer-backed email transport for the Coordinator (Respective Cell) Portal.
 *
 * If SMTP_* env vars are configured it uses them; otherwise it auto-creates a
 * free Ethereal test inbox and returns a preview URL per send. Mirrors the TEC
 * reference provider design (CommonJS port).
 *
 * getTransporter() lazily builds (and memoizes) the transport. verifyTransport()
 * checks SMTP connectivity/auth and NEVER throws — email failures must never
 * take down the server or roll back a business action.
 */

let transporter = null;
let initializing = null;

/** Lazily build + memoize the Nodemailer transport. */
async function getTransporter() {
  if (transporter) return transporter;
  if (initializing) return initializing;

  initializing = (async () => {
    if (env.email.host && env.email.user) {
      transporter = nodemailer.createTransport({
        host: env.email.host,
        port: env.email.port || 587,
        secure: env.email.secure,
        auth: { user: env.email.user, pass: env.email.pass },
      });
      logger.info('Email transport: configured SMTP', { host: env.email.host });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      logger.info('Email transport: Ethereal test account created', { user: testAccount.user });
    }
    return transporter;
  })();

  return initializing;
}

/**
 * Send a single message via the transport. Returns a normalized result object.
 * Never throws — a delivery failure is captured in the returned result.
 */
async function sendMail(args) {
  try {
    const tx = await getTransporter();
    const info = await tx.sendMail({
      from: env.email.from,
      to: args.to,
      cc: args.cc,
      subject: args.subject,
      text: args.text,
      html: args.html,
      attachments: args.attachments,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info) || null;
    return {
      status: 'sent',
      previewUrl: previewUrl ? String(previewUrl) : null,
      error: null,
      messageId: info.messageId || null,
    };
  } catch (err) {
    logger.error('Email send failed', { err: err && err.message, to: args.to });
    return {
      status: 'failed',
      previewUrl: null,
      error: err instanceof Error ? err.message : 'Unknown email error',
      messageId: null,
    };
  }
}

/**
 * Verify SMTP connectivity + auth. Used at startup so a misconfigured mailbox
 * surfaces immediately in the logs — but never throws, so the server keeps
 * serving with email gracefully disabled.
 */
async function verifyTransport() {
  try {
    const tx = await getTransporter();
    await tx.verify();
    return true;
  } catch (err) {
    logger.error('Email transport verify failed', { err: err && err.message });
    return false;
  }
}

module.exports = { getTransporter, sendMail, verifyTransport };
