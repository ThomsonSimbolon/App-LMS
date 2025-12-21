const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { verifyToken, hasRole } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(verifyToken);
router.use(hasRole(['ADMIN', 'SUPER_ADMIN']));

// Get activity logs with filters
router.get('/', activityLogController.getActivityLogs);

// Get activity log statistics
router.get('/stats', activityLogController.getActivityLogStats);

module.exports = router;

