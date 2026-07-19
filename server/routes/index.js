const { Router } = require('express');
const { env } = require('../config/env');
const authRoutes = require('./authRoutes');
const meRoutes = require('./meRoutes');
const trainingRoutes = require('./trainingRoutes');
const studentRoutes = require('./studentRoutes');
const { students, applications, notifications } = require('./resourceRoutes');

const router = Router();

// Owned by the Coordinator Portal backend
router.use('/auth', authRoutes);
router.use('/me', meRoutes); // list endpoints (students/applications/trainings/evaluations/notifications)
router.use('/trainings', trainingRoutes); // Coordinator-owned collection

// Student-facing (shared student JWT) — Attendance Form download (owner serves it)
router.use('/student', studentRoutes);

// Read-only over sibling-owned collections (students/applications) + shared notifications
router.use('/students', students);
router.use('/applications', applications);
router.use('/notifications', notifications);

// DEV-ONLY email test routes — never mounted in production.
if (env.nodeEnv !== 'production') {
  router.use('/test', require('./testRoutes'));
}

module.exports = router;
