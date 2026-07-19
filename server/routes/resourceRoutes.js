const { Router } = require('express');
const { requireAuth, requireCoordinator } = require('../middleware/auth');
const studentController = require('../controllers/studentController');
const notificationController = require('../controllers/notificationController');

// Item-level reads + notification writes (all coordinator-scoped).
const students = Router();
students.use(requireAuth, requireCoordinator);
students.get('/:studentId', studentController.getStudent);

const applications = Router();
applications.use(requireAuth, requireCoordinator);
applications.get('/:id', studentController.getApplication);

const notifications = Router();
notifications.use(requireAuth, requireCoordinator);
notifications.patch('/read-all', notificationController.markAllRead);
notifications.patch('/:id/read', notificationController.markRead);

module.exports = { students, applications, notifications };
