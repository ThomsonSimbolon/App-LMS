const { Notification } = require('../models');

/**
 * Notification Service
 * 
 * Centralized service for creating in-app notifications.
 * Supports single and batch notifications.
 * Designed to be pluggable with Socket.io for real-time updates (optional).
 */

/**
 * Create a single notification
 * 
 * @param {number} userId - User ID to notify
 * @param {Object} payload - Notification payload
 * @param {string} payload.title - Notification title
 * @param {string} payload.message - Notification message
 * @param {string} payload.type - Notification type (INFO, SUCCESS, WARNING, ERROR)
 * @param {string} payload.entityType - Related entity type (optional)
 * @param {number} payload.entityId - Related entity ID (optional)
 * @returns {Promise<Object>} Created notification
 */
const notify = async (userId, payload) => {
  try {
    const { title, message, type = 'INFO', entityType = null, entityId = null } = payload;

    if (!title || !message) {
      throw new Error('Title and message are required');
    }

    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      entityType,
      entityId,
      isRead: false
    });

    // TODO: Emit Socket.io event if enabled (optional)
    // if (io) {
    //   io.to(`user:${userId}`).emit('notification', notification);
    // }

    return notification;
  } catch (error) {
    console.error(`[NotificationService] Failed to create notification for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Create notifications for multiple users (batch)
 * 
 * @param {number[]} userIds - Array of user IDs
 * @param {Object} payload - Notification payload (same as notify)
 * @returns {Promise<Object[]>} Array of created notifications
 */
const notifyBatch = async (userIds, payload) => {
  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new Error('User IDs array is required');
    }

    const { title, message, type = 'INFO', entityType = null, entityId = null } = payload;

    if (!title || !message) {
      throw new Error('Title and message are required');
    }

    // Create notifications in batch
    const notifications = await Notification.bulkCreate(
      userIds.map(userId => ({
        userId,
        title,
        message,
        type,
        entityType,
        entityId,
        isRead: false
      }))
    );

    // TODO: Emit Socket.io events if enabled (optional)
    // if (io) {
    //   notifications.forEach(notification => {
    //     io.to(`user:${notification.userId}`).emit('notification', notification);
    //   });
    // }

    return notifications;
  } catch (error) {
    console.error(`[NotificationService] Failed to create batch notifications:`, error);
    throw error;
  }
};

/**
 * Notify user about course enrollment success
 * @param {number} userId - User ID
 * @param {Object} course - Course object
 */
const notifyCourseEnrollment = async (userId, course) => {
  return await notify(userId, {
    title: 'Enrollment Successful',
    message: `You have successfully enrolled in "${course.title}"`,
    type: 'SUCCESS',
    entityType: 'COURSE',
    entityId: course.id
  });
};

/**
 * Notify user about quiz result
 * @param {number} userId - User ID
 * @param {Object} quiz - Quiz object
 * @param {number} score - Quiz score
 * @param {boolean} isPassed - Whether user passed
 */
const notifyQuizResult = async (userId, quiz, score, isPassed) => {
  return await notify(userId, {
    title: isPassed ? 'Quiz Passed!' : 'Quiz Result',
    message: isPassed
      ? `Congratulations! You passed "${quiz.title}" with a score of ${score}%`
      : `You scored ${score}% on "${quiz.title}". Keep practicing!`,
    type: isPassed ? 'SUCCESS' : 'INFO',
    entityType: 'QUIZ',
    entityId: quiz.id
  });
};

/**
 * Notify user about certificate status
 * @param {number} userId - User ID
 * @param {Object} certificate - Certificate object
 * @param {string} status - Certificate status (APPROVED, REJECTED)
 * @param {string} rejectionReason - Reason for rejection (if rejected)
 */
const notifyCertificateStatus = async (userId, certificate, status, rejectionReason = null) => {
  if (status === 'APPROVED') {
    return await notify(userId, {
      title: 'Certificate Approved',
      message: `Your certificate for "${certificate.course?.title || 'course'}" has been approved!`,
      type: 'SUCCESS',
      entityType: 'CERTIFICATE',
      entityId: certificate.id
    });
  } else if (status === 'REJECTED') {
    return await notify(userId, {
      title: 'Certificate Rejected',
      message: `Your certificate request has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
      type: 'WARNING',
      entityType: 'CERTIFICATE',
      entityId: certificate.id
    });
  } else if (status === 'PENDING') {
    return await notify(userId, {
      title: 'Certificate Request Submitted',
      message: `Your certificate request for "${certificate.course?.title || 'course'}" is pending approval.`,
      type: 'INFO',
      entityType: 'CERTIFICATE',
      entityId: certificate.id
    });
  }
};

module.exports = {
  notify,
  notifyBatch,
  notifyCourseEnrollment,
  notifyQuizResult,
  notifyCertificateStatus
};

