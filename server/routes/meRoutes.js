const { Router } = require('express');
const { requireAuth, requireCoordinator } = require('../middleware/auth');
const studentController = require('../controllers/studentController');
const trainingController = require('../controllers/trainingController');
const notificationController = require('../controllers/notificationController');

const router = Router();
router.use(requireAuth, requireCoordinator);

router.get('/students', studentController.listAssignedStudents);
router.get('/applications', studentController.listApplications);
router.get('/trainings', trainingController.list);
router.get('/evaluations', trainingController.listEvaluations);
router.get('/notifications', notificationController.list);

module.exports = router;
