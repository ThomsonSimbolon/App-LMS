const express = require('express');
const router = express.Router();
const lessonProgressController = require('../controllers/lessonProgressController');
const { verifyToken } = require('../middleware/auth');

// All lesson routes require authentication
router.use(verifyToken);

// Lesson content and progress
router.get('/:lessonId/content', lessonProgressController.getLessonContent);
router.post('/:lessonId/complete', lessonProgressController.markLessonComplete);
router.patch('/:lessonId/watch-time', lessonProgressController.updateWatchTime);

module.exports = router;
