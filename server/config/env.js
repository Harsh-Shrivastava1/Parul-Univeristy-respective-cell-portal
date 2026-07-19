require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';

/** Require an env var; throw at startup if missing (no silent dev fallback). */
function required(key) {
  const v = process.env[key];
  if (v === undefined || v === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return v;
}

/**
 * Coordinator (Respective Cell) Portal backend configuration.
 * Connects to the SAME shared MongoDB Atlas database (parul_internship_system)
 * used by the Student, TEC Cell and Admin portals. Owns ONLY the `trainings`
 * collection (+ embedded evaluation and attendance-form metadata).
 */
const env = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd,
  frontendOrigins: (
    process.env.FRONTEND_ORIGINS ||
    'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:3000'
  ).split(',').map((s) => s.trim()),

  mongoUri: process.env.MONGODB_URI || '',
  mongoDbName: process.env.MONGODB_DB_NAME || 'parul_internship_system',

  jwt: {
    // REQUIRED — the server refuses to start with default authentication secrets.
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessTtl: process.env.ACCESS_TOKEN_TTL || '15m',
    refreshTtl: process.env.REFRESH_TOKEN_TTL || '7d',
  },
  // Shared secret used to VERIFY student access tokens for the student-facing
  // Attendance Form download. REQUIRED — must EXACTLY match the Student backend's
  // JWT_ACCESS_SECRET (fails fast so a broken cross-portal contract is caught).
  studentJwtAccessSecret: required('STUDENT_JWT_ACCESS_SECRET'),
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

  /**
   * Email (Nodemailer) — GRACEFUL/OPTIONAL. Never uses required(): if SMTP_* is
   * unset the mailer falls back to an Ethereal test inbox, and the server still
   * boots. Lifecycle emails are best-effort and never block a business action.
   */
  email: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from:
      process.env.MAIL_FROM ||
      process.env.EMAIL_FROM ||
      'Internship Management System <no-reply@icmp.local>',
    provider: process.env.SMTP_HOST ? 'gmail-smtp' : 'ethereal',
  },
};

/**
 * Cookie policy — same-site strict by default. For a cross-site deployment set
 * COOKIE_SAMESITE=none (which forces Secure=true).
 */
const sameSite = (process.env.COOKIE_SAMESITE || 'strict').toLowerCase();
const secureCookie = sameSite === 'none' ? true : process.env.COOKIE_SECURE
  ? process.env.COOKIE_SECURE === 'true'
  : isProd;

const cookieOptions = {
  httpOnly: true,
  secure: secureCookie,
  sameSite,
  path: '/',
};

const ACCESS_COOKIE = 'coordinator_access';
const REFRESH_COOKIE = 'coordinator_refresh';
// Cookie minted by the Student Portal backend (for the student-facing
// Attendance Form download).
const STUDENT_ACCESS_COOKIE = 'student_access';
const ACCESS_MAX_AGE = 15 * 60 * 1000; // 15 minutes — matches ACCESS_TOKEN_TTL
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days — matches REFRESH_TOKEN_TTL

module.exports = {
  env,
  cookieOptions,
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  STUDENT_ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_MAX_AGE,
};
