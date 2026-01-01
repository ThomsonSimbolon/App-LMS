const { DiscussionThread, DiscussionReply, Lesson, User, Enrollment } = require('../models');
const { Op } = require('sequelize');
const discussionService = require('../services/discussionService');

/**
 * Create a new discussion thread
 */
exports.createThread = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, content } = req.body;
    const userId = req.user.userId;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Title and content are required'
      });
    }

    // Verify lesson exists and is DISCUSSION type
    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Enrollment,
          as: 'enrollments',
          where: { userId },
          required: false,
          attributes: []
        }
      ]
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    if (lesson.type !== 'DISCUSSION') {
      return res.status(400).json({
        success: false,
        error: 'Invalid lesson type',
        message: 'This endpoint is only for DISCUSSION lessons'
      });
    }

    // Check if user is enrolled (optional - can be removed if discussion is open)
    // For now, we'll allow it if user has access to the lesson

    // Create thread
    const thread = await DiscussionThread.create({
      lessonId: parseInt(lessonId),
      userId,
      title,
      content
    });

    // Fetch with author info
    const threadData = await DiscussionThread.findByPk(thread.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Thread created successfully',
      data: threadData
    });

  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Get all threads for a lesson
 */
exports.getThreads = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Verify lesson exists
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    // Get threads (pinned first, then by last reply or creation date)
    const { count, rows: threads } = await DiscussionThread.findAndCountAll({
      where: { lessonId: parseInt(lessonId) },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ['isPinned', 'DESC'],
        ['lastReplyAt', 'DESC', 'NULLS LAST'],
        ['createdAt', 'DESC']
      ],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        threads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Get single thread with replies
 */
exports.getThread = async (req, res) => {
  try {
    const { threadId } = req.params;

    const thread = await DiscussionThread.findByPk(threadId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: DiscussionReply,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
              model: DiscussionReply,
              as: 'childReplies',
              include: [
                {
                  model: User,
                  as: 'author',
                  attributes: ['id', 'firstName', 'lastName', 'email']
                }
              ],
              order: [['createdAt', 'ASC']]
            }
          ],
          where: {
            parentReplyId: null // Top-level replies only
          },
          order: [['createdAt', 'ASC']],
          required: false
        }
      ]
    });

    if (!thread) {
      return res.status(404).json({
        success: false,
        error: 'Thread not found'
      });
    }

    res.status(200).json({
      success: true,
      data: thread
    });

  } catch (error) {
    console.error('Get thread error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Create a reply to a thread
 */
exports.createReply = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { content, parentReplyId } = req.body;
    const userId = req.user.userId;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Content is required'
      });
    }

    // Verify thread exists and is not locked
    const thread = await DiscussionThread.findByPk(threadId);
    if (!thread) {
      return res.status(404).json({
        success: false,
        error: 'Thread not found'
      });
    }

    if (thread.isLocked) {
      return res.status(403).json({
        success: false,
        error: 'Thread locked',
        message: 'This thread is locked. No new replies are allowed.'
      });
    }

    // If parentReplyId is provided, verify it exists
    if (parentReplyId) {
      const parentReply = await DiscussionReply.findByPk(parentReplyId);
      if (!parentReply || parentReply.threadId !== parseInt(threadId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid parent reply',
          message: 'Parent reply not found or does not belong to this thread'
        });
      }
    }

    // Create reply
    const reply = await DiscussionReply.create({
      threadId: parseInt(threadId),
      userId,
      content,
      parentReplyId: parentReplyId || null
    });

    // Update thread stats
    await discussionService.updateThreadStats(threadId);

    // Fetch with author info
    const replyData = await DiscussionReply.findByPk(reply.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Reply created successfully',
      data: replyData
    });

  } catch (error) {
    console.error('Create reply error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Update thread (author only)
 */
exports.updateThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { title, content } = req.body;
    const userId = req.user.userId;

    const thread = await DiscussionThread.findByPk(threadId);
    if (!thread) {
      return res.status(404).json({
        success: false,
        error: 'Thread not found'
      });
    }

    // Check ownership
    if (thread.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only edit your own threads'
      });
    }

    // Update thread
    await thread.update({
      title: title || thread.title,
      content: content || thread.content
    });

    res.status(200).json({
      success: true,
      message: 'Thread updated successfully',
      data: thread
    });

  } catch (error) {
    console.error('Update thread error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Delete thread (author or instructor)
 */
exports.deleteThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.roleName;

    const thread = await DiscussionThread.findByPk(threadId, {
      include: [
        {
          model: Lesson,
          as: 'lesson',
          attributes: ['id', 'sectionId']
        }
      ]
    });

    if (!thread) {
      return res.status(404).json({
        success: false,
        error: 'Thread not found'
      });
    }

    // Check permission (author or instructor/admin)
    const isAuthor = thread.userId === userId;
    const isInstructor = ['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(userRole);

    if (!isAuthor && !isInstructor) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to delete this thread'
      });
    }

    await thread.destroy();

    res.status(200).json({
      success: true,
      message: 'Thread deleted successfully'
    });

  } catch (error) {
    console.error('Delete thread error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Pin/unpin thread (instructor only)
 */
exports.pinThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { isPinned } = req.body;
    const userRole = req.user.roleName;

    // Check if user is instructor/admin
    if (!['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Only instructors can pin threads'
      });
    }

    const thread = await DiscussionThread.findByPk(threadId);
    if (!thread) {
      return res.status(404).json({
        success: false,
        error: 'Thread not found'
      });
    }

    await thread.update({ isPinned: isPinned === true });

    res.status(200).json({
      success: true,
      message: `Thread ${isPinned ? 'pinned' : 'unpinned'} successfully`,
      data: thread
    });

  } catch (error) {
    console.error('Pin thread error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Get user participation stats for a lesson
 */
exports.getParticipation = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.userId;

    const participation = await discussionService.getUserParticipation(lessonId, userId);

    res.status(200).json({
      success: true,
      data: participation
    });

  } catch (error) {
    console.error('Get participation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

