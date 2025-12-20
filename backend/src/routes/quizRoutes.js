const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { verifyToken, hasRole } = require('../middleware/auth');

// Student routes (authenticated)
router.get('/:quizId', verifyToken, quizController.getQuizDetails);
router.post('/:quizId/start', verifyToken, quizController.startQuiz);
router.post('/:quizId/submit', verifyToken, quizController.submitQuiz);
router.get('/:quizId/results', verifyToken, quizController.getQuizResults);

// Instructor/Admin routes
router.post('/', 
  verifyToken, 
  hasRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']), 
  quizController.createQuiz
);

router.post('/:quizId/questions', 
  verifyToken, 
  hasRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']), 
  quizController.addQuestion
);

module.exports = router;
