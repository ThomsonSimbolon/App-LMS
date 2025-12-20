const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { verifyToken } = require('../middleware/auth');

// All enrollment routes require authentication
router.use(verifyToken);

// Enrollment management
router.post('/', enrollmentController.enrollCourse);
router.get('/me', enrollmentController.getMyEnrollments);
router.get('/:enrollmentId/learn', enrollmentController.getLearningData);
router.get('/:enrollmentId/progress', enrollmentController.getEnrollmentProgress);
router.delete('/:enrollmentId', enrollmentController.unenrollCourse);

module.exports = router;
