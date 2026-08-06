const { Router } = require('express');
const { requireAuth, requireCoordinator } = require('../middleware/auth');
const ctrl = require('../controllers/trainingController');

const router = Router();
router.use(requireAuth, requireCoordinator);

// Coordinator-owned writes + reads on the trainings collection.
router.post('/', ctrl.create); // create + start (assign mentor/schedule)
router.post('/assign-mentor', ctrl.assignMentor); // bulk mentor assignment
router.post('/start-bulk', ctrl.startBulk); // bulk schedule + start training
router.get('/:id', ctrl.getOne);
router.patch('/:id', ctrl.update);
router.post('/:id/start', ctrl.start);
router.post('/:id/complete', ctrl.complete);
router.post('/:id/evaluation', ctrl.evaluation);
router.get('/:id/attendance-form', ctrl.downloadAttendance);
router.post('/:id/attendance-form', ctrl.generateAttendance);

module.exports = router;
