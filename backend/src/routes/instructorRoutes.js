const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const { verifyToken, hasRole } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// Get instructor dashboard statistics
router.get(
  '/dashboard/stats',
  hasRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']),
  instructorController.getDashboardStats
);

// Get students enrolled in instructor's courses
router.get(
  '/students',
  hasRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']),
  instructorController.getMyStudents
);

// Get instructor analytics
router.get(
  '/analytics',
  hasRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']),
  instructorController.getMyAnalytics
);

module.exports = router;

