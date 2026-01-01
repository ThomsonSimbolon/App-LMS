const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// Get threads for a lesson
router.get('/lessons/:lessonId/threads', discussionController.getThreads);

// Get single thread with replies
router.get('/threads/:threadId', discussionController.getThread);

// Create thread
router.post('/lessons/:lessonId/threads', discussionController.createThread);

// Create reply
router.post('/threads/:threadId/replies', discussionController.createReply);

// Update thread
router.patch('/threads/:threadId', discussionController.updateThread);

// Delete thread
router.delete('/threads/:threadId', discussionController.deleteThread);

// Pin/unpin thread
router.patch('/threads/:threadId/pin', discussionController.pinThread);

// Get user participation stats
router.get('/lessons/:lessonId/participation', discussionController.getParticipation);

module.exports = router;

