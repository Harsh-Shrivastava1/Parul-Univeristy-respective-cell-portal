const { Router } = require('express');
const authController = require('../controllers/authController');
const { requireAuth, requireCoordinator } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

const router = Router();

router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.get('/me', requireAuth, requireCoordinator, authController.me);
router.post('/change-password', authLimiter, requireAuth, requireCoordinator, authController.changePassword);
router.post('/logout', requireAuth, authController.logout);

module.exports = router;
