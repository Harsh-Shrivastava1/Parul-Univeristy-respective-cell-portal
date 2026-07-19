const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { env } = require('./config/env');
const connectDB = require('./config/db');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { verifyEmailTransport } = require('./services/email/mailer');

const app = express();

// Correct client IPs when behind a reverse proxy (needed for rate limiting).
app.set('trust proxy', 1);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.frontendOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Parul Coordinator Portal API is running', db: env.mongoDbName });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.path}` });
});

// Central error handler (last)
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('❌  Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  // Best-effort SMTP connectivity check — NON-FATAL. A misconfigured mailbox is
  // logged but never stops the server from serving; email is gracefully disabled.
  verifyEmailTransport()
    .then((ok) => {
      console.log(ok ? '✉️   Email transport verified' : '⚠️   Email transport unavailable — emails disabled');
    })
    .catch(() => {
      console.log('⚠️   Email transport verification error — emails disabled');
    });

  app.listen(env.port, () => {
    console.log(`🚀  Coordinator Portal API on http://localhost:${env.port}`);
    console.log(`📡  API base: http://localhost:${env.port}/api`);
  });
};

start();
