const { DiscussionThread, DiscussionReply, Lesson, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Discussion Service
 * 
 * Handles discussion forum operations and participation tracking.
 */

/**
 * Get user participation stats for a lesson
 * @param {number} lessonId - Lesson ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Participation stats
 */
const getUserParticipation = async (lessonId, userId) => {
  try {
    const threadCount = await DiscussionThread.count({
      where: {
        lessonId,
        userId
      }
    });

    // Get all thread IDs for this lesson
    const threads = await DiscussionThread.findAll({
      where: { lessonId },
      attributes: ['id']
    });
    const threadIds = threads.map(t => t.id);

    const replyCount = threadIds.length > 0 ? await DiscussionReply.count({
      where: {
        threadId: {
          [Op.in]: threadIds
        },
        userId
      }
    }) : 0;

    return {
      threadCount,
      replyCount,
      totalParticipation: threadCount + replyCount
    };
  } catch (error) {
    console.error('[DiscussionService] Failed to get user participation:', error);
    throw error;
  }
};

/**
 * Update thread reply count and last reply timestamp
 * @param {number} threadId - Thread ID
 */
const updateThreadStats = async (threadId) => {
  try {
    const replyCount = await DiscussionReply.count({
      where: { threadId }
    });

    const lastReply = await DiscussionReply.findOne({
      where: { threadId },
      order: [['createdAt', 'DESC']],
      attributes: ['createdAt']
    });

    await DiscussionThread.update(
      {
        replyCount,
        lastReplyAt: lastReply ? lastReply.createdAt : null
      },
      {
        where: { id: threadId }
      }
    );
  } catch (error) {
    console.error('[DiscussionService] Failed to update thread stats:', error);
    throw error;
  }
};

module.exports = {
  getUserParticipation,
  updateThreadStats
};

