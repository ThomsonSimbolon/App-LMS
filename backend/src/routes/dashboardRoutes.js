const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, hasRole } = require('../middleware/auth');

// All dashboard routes require authentication
router.use(verifyToken);

// Get dashboard statistics (Admin/Super Admin only)
router.get('/stats', hasRole(['ADMIN', 'SUPER_ADMIN']), dashboardController.getDashboardStats);

module.exports = router;

