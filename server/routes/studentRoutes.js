const { Router } = require('express');
const { requireStudent } = require('../middleware/studentAuth');
const studentDoc = require('../controllers/studentDocumentController');

// Student-facing (shared student JWT) — Attendance Form download only.
const router = Router();
router.get('/attendance-form/:applicationId', requireStudent, studentDoc.downloadAttendanceForm);

module.exports = router;
