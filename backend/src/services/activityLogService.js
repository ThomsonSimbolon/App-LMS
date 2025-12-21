const { ActivityLog } = require('../models');

/**
 * Activity Log Service
 * 
 * Centralized service for logging system activities.
 * All logging operations are non-blocking and fail-safe.
 * Logging failures will not break the main business flow.
 */

/**
 * Extract IP address from request object
 * @param {Object} req - Express request object
 * @returns {string|null} - IP address or null
 */
const getIpAddress = (req) => {
  if (!req) return null;
  
  // Check for forwarded IP (when behind proxy/load balancer)
  return req.ip || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         (req.headers['x-forwarded-for']?.split(',')[0]?.trim()) ||
         req.headers['x-real-ip'] ||
         null;
};

/**
 * Extract user agent from request object
 * @param {Object} req - Express request object
 * @returns {string|null} - User agent string or null
 */
const getUserAgent = (req) => {
  if (!req) return null;
  return req.headers['user-agent'] || null;
};

/**
 * Log an activity event
 * 
 * This function is non-blocking and fail-safe.
 * It will not throw errors that could break the main business flow.
 * 
 * @param {string} eventType - Type of event (USER_LOGIN, COURSE_ENROLL, etc.)
 * @param {Object|null} user - User object (can be null for system events)
 * @param {Object} entity - Entity object with type and id
 * @param {Object} metadata - Additional metadata (optional)
 * @param {Object} req - Express request object (optional, for IP and user agent)
 * @returns {Promise<void>}
 */
const log = async (eventType, user, entity, metadata = null, req = null) => {
  try {
    // Validate eventType
    const validEventTypes = [
      'USER_LOGIN',
      'COURSE_ENROLL',
      'LESSON_COMPLETE',
      'QUIZ_SUBMIT',
      'CERT_REQUESTED',
      'CERT_APPROVED',
      'CERT_REJECTED',
      'ASSESSOR_ASSIGNED_TO_COURSE',
      'ASSESSOR_UNASSIGNED_FROM_COURSE'
    ];
    
    if (!validEventTypes.includes(eventType)) {
      console.warn(`[ActivityLog] Invalid eventType: ${eventType}`);
      return;
    }

    // Validate entity
    if (!entity || !entity.type || !entity.id) {
      console.warn(`[ActivityLog] Invalid entity object for event: ${eventType}`);
      return;
    }

    // Prepare log data
    const logData = {
      userId: user?.id || null,
      eventType,
      entityType: entity.type,
      entityId: entity.id,
      metadata: metadata ? JSON.stringify(metadata) : null,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    };

    // Create log entry asynchronously (non-blocking)
    // Use setImmediate to ensure it doesn't block the main thread
    setImmediate(async () => {
      try {
        await ActivityLog.create(logData);
      } catch (error) {
        // Fail-safe: log error but don't throw
        console.error(`[ActivityLog] Failed to log event ${eventType}:`, error.message);
      }
    });

  } catch (error) {
    // Fail-safe: catch any unexpected errors
    console.error(`[ActivityLog] Unexpected error in log function:`, error.message);
  }
};

/**
 * Log user login event
 * @param {Object} user - User object
 * @param {Object} req - Express request object
 */
const logUserLogin = async (user, req) => {
  await log(
    'USER_LOGIN',
    user,
    { type: 'USER', id: user.id },
    { email: user.email, roleId: user.roleId },
    req
  );
};

/**
 * Log course enrollment event
 * @param {Object} user - User object
 * @param {Object} course - Course object
 * @param {Object} req - Express request object
 */
const logCourseEnroll = async (user, course, req) => {
  await log(
    'COURSE_ENROLL',
    user,
    { type: 'COURSE', id: course.id },
    { courseTitle: course.title, courseId: course.id },
    req
  );
};

/**
 * Log lesson completion event
 * @param {Object} user - User object
 * @param {Object} lesson - Lesson object
 * @param {Object} metadata - Additional metadata (watchTime, etc.)
 * @param {Object} req - Express request object
 */
const logLessonComplete = async (user, lesson, metadata = {}, req = null) => {
  await log(
    'LESSON_COMPLETE',
    user,
    { type: 'COURSE', id: lesson.section?.courseId || metadata.courseId },
    { 
      lessonId: lesson.id, 
      lessonTitle: lesson.title,
      ...metadata 
    },
    req
  );
};

/**
 * Log quiz submission event
 * @param {Object} user - User object
 * @param {Object} quiz - Quiz object
 * @param {Object} metadata - Additional metadata (score, isPassed, etc.)
 * @param {Object} req - Express request object
 */
const logQuizSubmit = async (user, quiz, metadata = {}, req = null) => {
  await log(
    'QUIZ_SUBMIT',
    user,
    { type: 'QUIZ', id: quiz.id },
    { 
      quizId: quiz.id,
      quizTitle: quiz.title,
      ...metadata 
    },
    req
  );
};

/**
 * Log certificate request event
 * @param {Object} user - User object
 * @param {Object} certificate - Certificate object
 * @param {Object} req - Express request object
 */
const logCertRequested = async (user, certificate, req) => {
  await log(
    'CERT_REQUESTED',
    user,
    { type: 'CERTIFICATE', id: certificate.id },
    { 
      certificateNumber: certificate.certificateNumber,
      courseId: certificate.courseId 
    },
    req
  );
};

/**
 * Log certificate approval event
 * @param {Object} approver - Approver user object
 * @param {Object} certificate - Certificate object
 * @param {Object} req - Express request object
 */
const logCertApproved = async (approver, certificate, req) => {
  await log(
    'CERT_APPROVED',
    approver,
    { type: 'CERTIFICATE', id: certificate.id },
    { 
      certificateNumber: certificate.certificateNumber,
      courseId: certificate.courseId,
      studentId: certificate.userId 
    },
    req
  );
};

/**
 * Log certificate rejection event
 * @param {Object} approver - Approver user object
 * @param {Object} certificate - Certificate object
 * @param {string} rejectionReason - Reason for rejection
 * @param {Object} req - Express request object
 */
const logCertRejected = async (approver, certificate, rejectionReason, req) => {
  await log(
    'CERT_REJECTED',
    approver,
    { type: 'CERTIFICATE', id: certificate.id },
    { 
      certificateNumber: certificate.certificateNumber,
      courseId: certificate.courseId,
      studentId: certificate.userId,
      rejectionReason 
    },
    req
  );
};

/**
 * Log assessor assignment to course event
 * @param {Object} user - Admin/SUPER_ADMIN who assigned the assessor
 * @param {Object} course - Course object
 * @param {Object} assessor - Assessor (User) object
 * @param {Object} req - Express request object
 */
const logAssessorAssigned = async (user, course, assessor, req) => {
  await log(
    'ASSESSOR_ASSIGNED_TO_COURSE',
    user,
    { type: 'COURSE', id: course.id },
    { 
      courseId: course.id,
      courseTitle: course.title,
      assessorId: assessor.id,
      assessorEmail: assessor.email,
      assessorName: `${assessor.firstName} ${assessor.lastName || ''}`.trim()
    },
    req
  );
};

/**
 * Log assessor unassignment from course event
 * @param {Object} user - Admin/SUPER_ADMIN who unassigned the assessor
 * @param {Object} course - Course object
 * @param {Object} assessor - Assessor (User) object
 * @param {Object} req - Express request object
 */
const logAssessorUnassigned = async (user, course, assessor, req) => {
  await log(
    'ASSESSOR_UNASSIGNED_FROM_COURSE',
    user,
    { type: 'COURSE', id: course.id },
    { 
      courseId: course.id,
      courseTitle: course.title,
      assessorId: assessor.id,
      assessorEmail: assessor.email,
      assessorName: `${assessor.firstName} ${assessor.lastName || ''}`.trim()
    },
    req
  );
};

module.exports = {
  log,
  logUserLogin,
  logCourseEnroll,
  logLessonComplete,
  logQuizSubmit,
  logCertRequested,
  logCertApproved,
  logCertRejected,
  logAssessorAssigned,
  logAssessorUnassigned
};

