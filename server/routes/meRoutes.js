const { Router } = require('express');
const { requireAuth, requireCoordinator } = require('../middleware/auth');
const studentController = require('../controllers/studentController');
const trainingController = require('../controllers/trainingController');
const notificationController = require('../controllers/notificationController');
const applicationActionController = require('../controllers/applicationActionController');

const router = Router();
router.use(requireAuth, requireCoordinator);

router.get('/students', studentController.listAssignedStudents);
router.get('/applications', studentController.listApplications);
// Department command-writes: reject (before join) / terminate (after join).
router.post('/applications/:id/reject', applicationActionController.reject);
router.post('/applications/:id/terminate', applicationActionController.terminate);
router.post('/applications/:id/complete-internship', applicationActionController.completeInternship);
router.get('/trainings', trainingController.list);
router.get('/evaluations', trainingController.listEvaluations);
router.get('/notifications', notificationController.list);

module.exports = router;
