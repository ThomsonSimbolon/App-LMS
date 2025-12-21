const { Lesson, LessonProgress, Enrollment, Section, Course, Quiz, ExamResult } = require('../models');

/**
 * LessonCompletionService
 * 
 * Centralized service for lesson completion validation and management.
 * Handles type-specific completion rules, prevents client-side spoofing,
 * and enforces sequential completion when required.
 */
class LessonCompletionService {
  /**
   * Validate content schema based on lesson type
   * 
   * @param {Object} lesson - Lesson instance
   * @returns {Object} Validation result { valid: boolean, message?: string, errors?: Array }
   */
  validateContentSchema(lesson) {
    const { type, content } = lesson;
    const contentObj = typeof content === 'string' ? JSON.parse(content) : content;
    const errors = [];

    if (!contentObj) {
      return { valid: true }; // Content is optional for some types
    }

    switch (type) {
      case 'VIDEO':
        if (!contentObj.videoUrl) {
          errors.push({ field: 'videoUrl', message: 'VIDEO lesson requires videoUrl in content' });
        }
        if (contentObj.minWatchPercentage !== undefined) {
          if (typeof contentObj.minWatchPercentage !== 'number' || 
              contentObj.minWatchPercentage < 0 || 
              contentObj.minWatchPercentage > 100) {
            errors.push({ 
              field: 'minWatchPercentage', 
              message: 'minWatchPercentage must be a number between 0 and 100' 
            });
          }
        }
        break;

      case 'MATERIAL':
        if (!contentObj.fileUrl && !contentObj.content) {
          errors.push({ 
            field: 'content', 
            message: 'MATERIAL lesson requires fileUrl or content in content object' 
          });
        }
        break;

      case 'LIVE_SESSION':
        // meetingUrl is optional (can be set later)
        if (contentObj.scheduledAt) {
          const scheduledDate = new Date(contentObj.scheduledAt);
          if (isNaN(scheduledDate.getTime())) {
            errors.push({ 
              field: 'scheduledAt', 
              message: 'scheduledAt must be a valid date string' 
            });
          }
        }
        break;

      case 'ASSIGNMENT':
        if (!contentObj.instructions) {
          errors.push({ 
            field: 'instructions', 
            message: 'ASSIGNMENT lesson requires instructions in content' 
          });
        }
        if (contentObj.submissionType && 
            !['FILE', 'TEXT', 'LINK', 'ANY'].includes(contentObj.submissionType)) {
          errors.push({ 
            field: 'submissionType', 
            message: 'submissionType must be FILE, TEXT, LINK, or ANY' 
          });
        }
        if (contentObj.deadline) {
          const deadlineDate = new Date(contentObj.deadline);
          if (isNaN(deadlineDate.getTime())) {
            errors.push({ 
              field: 'deadline', 
              message: 'deadline must be a valid date string' 
            });
          }
        }
        if (contentObj.maxScore !== undefined && 
            (typeof contentObj.maxScore !== 'number' || contentObj.maxScore < 0)) {
          errors.push({ 
            field: 'maxScore', 
            message: 'maxScore must be a non-negative number' 
          });
        }
        break;

      case 'QUIZ':
      case 'EXAM':
        if (contentObj.quizId !== undefined && typeof contentObj.quizId !== 'number') {
          errors.push({ 
            field: 'quizId', 
            message: 'quizId must be a number' 
          });
        }
        if (contentObj.passingScore !== undefined) {
          if (typeof contentObj.passingScore !== 'number' || 
              contentObj.passingScore < 0 || 
              contentObj.passingScore > 100) {
            errors.push({ 
              field: 'passingScore', 
              message: 'passingScore must be a number between 0 and 100' 
            });
          }
        }
        if (contentObj.timeLimit !== undefined && 
            (typeof contentObj.timeLimit !== 'number' || contentObj.timeLimit < 0)) {
          errors.push({ 
            field: 'timeLimit', 
            message: 'timeLimit must be a non-negative number' 
          });
        }
        break;

      case 'DISCUSSION':
        // Discussion content is flexible, no strict validation
        break;

      default:
        // Unknown type, but don't fail validation
        break;
    }

    if (errors.length > 0) {
      return {
        valid: false,
        message: `Content schema validation failed: ${errors.map(e => e.message).join(', ')}`,
        errors
      };
    }

    return { valid: true };
  }

  /**
   * Validate if a lesson can be completed by a user
   * 
   * @param {Object} lesson - Lesson instance with section and course
   * @param {number} userId - User ID attempting to complete
   * @param {Object} payload - Completion payload (watchTime, submissionData, etc.)
   * @returns {Promise<Object>} Validation result { allowed: boolean, message?: string, details?: Object }
   */
  async validateCompletion(lesson, userId, payload = {}) {
    const { watchTime, submissionData } = payload;
    const { type, content, duration, id: lessonId } = lesson;

    // Get enrollment
    const enrollment = await this._getEnrollment(lesson, userId);
    if (!enrollment) {
      return {
        allowed: false,
        message: 'You must be enrolled in the course to complete lessons'
      };
    }

    // Check if already completed
    const existingProgress = await LessonProgress.findOne({
      where: {
        enrollmentId: enrollment.id,
        lessonId: lessonId
      }
    });

    if (existingProgress?.isCompleted) {
      return {
        allowed: true,
        message: 'Lesson already completed',
        alreadyCompleted: true
      };
    }

    // Check sequential completion if required
    const sequentialCheck = await this._checkSequentialCompletion(lesson, enrollment);
    if (!sequentialCheck.allowed) {
      return sequentialCheck;
    }

    // Validate content schema first
    const schemaValidation = this.validateContentSchema(lesson);
    if (!schemaValidation.valid) {
      return {
        allowed: false,
        message: schemaValidation.message,
        details: { schemaErrors: schemaValidation.errors }
      };
    }

    // Type-specific validation
    switch (type) {
      case 'VIDEO':
        return this._validateVideoCompletion(lesson, watchTime, content, duration);

      case 'MATERIAL':
        return this._validateMaterialCompletion();

      case 'LIVE_SESSION':
        return this._validateLiveSessionCompletion();

      case 'ASSIGNMENT':
        return this._validateAssignmentCompletion(lesson, submissionData, content);

      case 'QUIZ':
      case 'EXAM':
        return await this._validateQuizExamCompletion(lesson, userId, enrollment);

      case 'DISCUSSION':
        return this._validateDiscussionCompletion();

      default:
        return {
          allowed: false,
          message: `Unknown lesson type: ${type}`
        };
    }
  }

  /**
   * Mark a lesson as complete (with full validation)
   * 
   * @param {number} lessonId - Lesson ID
   * @param {number} userId - User ID
   * @param {Object} payload - Completion payload
   * @returns {Promise<Object>} Completion result { success: boolean, progress?: Object, message?: string }
   */
  async markComplete(lessonId, userId, payload = {}) {
    // Get lesson with course info
    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Section,
          as: 'section',
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'requireSequentialCompletion']
            }
          ]
        }
      ]
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Validate completion
    const validation = await this.validateCompletion(lesson, userId, payload);
    if (!validation.allowed) {
      throw new Error(validation.message || 'Completion validation failed');
    }

    // If already completed, return existing progress
    if (validation.alreadyCompleted) {
      const enrollment = await this._getEnrollment(lesson, userId);
      const progress = await LessonProgress.findOne({
        where: {
          enrollmentId: enrollment.id,
          lessonId: lessonId
        }
      });
      return {
        success: true,
        progress,
        message: 'Lesson already completed'
      };
    }

    // Get enrollment
    const enrollment = await this._getEnrollment(lesson, userId);
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Create or update lesson progress
    const { watchTime } = payload;
    const [progress, created] = await LessonProgress.findOrCreate({
      where: {
        enrollmentId: enrollment.id,
        lessonId: lessonId
      },
      defaults: {
        isCompleted: true,
        completedAt: new Date(),
        watchTime: watchTime || 0
      }
    });

    if (!created && !progress.isCompleted) {
      await progress.update({
        isCompleted: true,
        completedAt: new Date(),
        watchTime: watchTime !== undefined ? watchTime : progress.watchTime
      });
    }

    // Recalculate enrollment progress
    await this._updateEnrollmentProgress(enrollment.id, lesson.section.course.id);

    return {
      success: true,
      progress,
      message: 'Lesson marked as complete'
    };
  }

  /**
   * Get completion status for a lesson
   * 
   * @param {number} lessonId - Lesson ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Status object { isCompleted: boolean, progress?: Object, canComplete: boolean, reason?: string }
   */
  async getCompletionStatus(lessonId, userId) {
    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Section,
          as: 'section',
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'requireSequentialCompletion']
            }
          ]
        }
      ]
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const enrollment = await this._getEnrollment(lesson, userId);
    if (!enrollment) {
      return {
        isCompleted: false,
        canComplete: false,
        reason: 'Not enrolled in course'
      };
    }

    const progress = await LessonProgress.findOne({
      where: {
        enrollmentId: enrollment.id,
        lessonId: lessonId
      }
    });

    const isCompleted = progress?.isCompleted || false;

    // Check if can complete (for UI purposes)
    let canComplete = false;
    let reason = '';

    if (isCompleted) {
      canComplete = false;
      reason = 'Already completed';
    } else {
      // Quick validation check
      const validation = await this.validateCompletion(lesson, userId, {});
      canComplete = validation.allowed;
      reason = validation.message || '';
    }

    return {
      isCompleted,
      progress: progress || null,
      canComplete,
      reason
    };
  }

  // ==================== Private Helper Methods ====================

  /**
   * Get enrollment for user and lesson's course
   */
  async _getEnrollment(lesson, userId) {
    const courseId = lesson.section?.course?.id || lesson.section?.courseId;
    if (!courseId) {
      return null;
    }

    return await Enrollment.findOne({
      where: {
        userId,
        courseId,
        status: 'ACTIVE'
      }
    });
  }

  /**
   * Check sequential completion requirement
   */
  async _checkSequentialCompletion(lesson, enrollment) {
    const course = lesson.section?.course;
    if (!course || !course.requireSequentialCompletion) {
      return { allowed: true };
    }

    // Get previous lesson in same section
    const previousLesson = await Lesson.findOne({
      where: {
        sectionId: lesson.sectionId,
        order: {
          [require('sequelize').Op.lt]: lesson.order
        }
      },
      order: [['order', 'DESC']],
      limit: 1
    });

    if (previousLesson) {
      const previousProgress = await LessonProgress.findOne({
        where: {
          enrollmentId: enrollment.id,
          lessonId: previousLesson.id,
          isCompleted: true
        }
      });

      if (!previousProgress) {
        return {
          allowed: false,
          message: `You must complete the previous lesson "${previousLesson.title}" first`
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Validate VIDEO completion
   */
  _validateVideoCompletion(lesson, watchTime, content, duration) {
    const minWatchPercentage = content?.minWatchPercentage || 80;
    const videoDuration = duration || content?.duration || 0;

    if (videoDuration > 0 && watchTime !== undefined) {
      const watchPercentage = (watchTime / videoDuration) * 100;
      if (watchPercentage < minWatchPercentage) {
        return {
          allowed: false,
          message: `You must watch at least ${minWatchPercentage}% of the video. Currently watched: ${Math.round(watchPercentage)}%`,
          details: {
            watchPercentage: Math.round(watchPercentage),
            requiredPercentage: minWatchPercentage,
            watchTime,
            duration: videoDuration
          }
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Validate MATERIAL completion
   */
  _validateMaterialCompletion() {
    // Material just needs to be viewed (no specific validation)
    return { allowed: true };
  }

  /**
   * Validate LIVE_SESSION completion
   */
  _validateLiveSessionCompletion() {
    // Live session requires instructor confirmation (attendance)
    // For now, allow student to mark as complete (instructor will verify later)
    return { allowed: true };
  }

  /**
   * Validate ASSIGNMENT completion
   */
  _validateAssignmentCompletion(lesson, submissionData, content) {
    // Check deadline
    if (content?.deadline) {
      const deadline = new Date(content.deadline);
      const now = new Date();
      if (now > deadline) {
        return {
          allowed: false,
          message: `Assignment deadline has passed. Deadline was: ${deadline.toLocaleString()}`,
          details: {
            deadline: deadline.toISOString(),
            isOverdue: true
          }
        };
      }
    }

    // Assignment requires submission
    if (!submissionData || (!submissionData.text && !submissionData.fileUrl && !submissionData.link)) {
      return {
        allowed: false,
        message: 'Assignment requires a submission (text, file, or link)',
        details: {
          submissionType: content?.submissionType || 'ANY',
          required: true
        }
      };
    }

    // Validate submission type if specified
    if (content?.submissionType) {
      const submissionType = content.submissionType.toUpperCase();
      if (submissionType === 'FILE' && !submissionData.fileUrl) {
        return {
          allowed: false,
          message: 'This assignment requires a file submission',
          details: { submissionType: 'FILE' }
        };
      }
      if (submissionType === 'TEXT' && !submissionData.text) {
        return {
          allowed: false,
          message: 'This assignment requires a text submission',
          details: { submissionType: 'TEXT' }
        };
      }
      if (submissionType === 'LINK' && !submissionData.link) {
        return {
          allowed: false,
          message: 'This assignment requires a link submission',
          details: { submissionType: 'LINK' }
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Validate QUIZ/EXAM completion
   */
  async _validateQuizExamCompletion(lesson, userId, enrollment) {
    // Quiz/Exam completion is handled through quiz submission (separate endpoint)
    // Check if there's a quiz linked to this lesson
    const quiz = await Quiz.findOne({
      where: {
        lessonId: lesson.id
      }
    });

    if (!quiz) {
      return {
        allowed: false,
        message: 'No quiz found for this lesson. Please contact the instructor.'
      };
    }

    // Check if user has passed the quiz
    const examResult = await ExamResult.findOne({
      where: {
        userId,
        quizId: quiz.id
      },
      order: [['submittedAt', 'DESC']]
    });

    if (!examResult) {
      return {
        allowed: false,
        message: 'You must complete and pass the quiz/exam first. Please take the quiz to proceed.',
        details: {
          quizId: quiz.id,
          quizTitle: quiz.title,
          passingScore: quiz.passingScore
        }
      };
    }

    if (!examResult.isPassed) {
      return {
        allowed: false,
        message: `You must pass the quiz/exam to complete this lesson. Your score: ${examResult.score}% (Required: ${quiz.passingScore}%)`,
        details: {
          score: examResult.score,
          passingScore: quiz.passingScore,
          attemptNumber: examResult.attemptNumber,
          maxAttempts: quiz.maxAttempts
        }
      };
    }

    // Quiz passed, can mark lesson as complete
    return {
      allowed: true,
      message: 'Quiz passed. Lesson can be marked as complete.',
      details: {
        score: examResult.score,
        attemptNumber: examResult.attemptNumber
      }
    };
  }

  /**
   * Validate DISCUSSION completion
   */
  _validateDiscussionCompletion() {
    // Discussion participation (basic check)
    // For now, allow basic completion (forum participation tracking can be added later)
    return { allowed: true };
  }

  /**
   * Update enrollment progress after lesson completion
   */
  async _updateEnrollmentProgress(enrollmentId, courseId) {
    const enrollment = await Enrollment.findByPk(enrollmentId);
    if (!enrollment) return;

    // Get total required lessons (only count required lessons)
    const totalLessons = await Lesson.count({
      include: [{
        model: Section,
        as: 'section',
        where: { courseId },
        attributes: []
      }],
      where: {
        isRequired: true
      }
    });

    // Get completed required lessons
    const completedLessons = await LessonProgress.count({
      include: [{
        model: Lesson,
        as: 'lesson',
        where: { isRequired: true },
        attributes: [],
        required: true
      }],
      where: {
        enrollmentId,
        isCompleted: true
      }
    });

    // Calculate progress percentage
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Update enrollment
    await enrollment.update({
      progress,
      status: progress === 100 ? 'COMPLETED' : 'ACTIVE',
      completedAt: progress === 100 ? new Date() : null
    });

    return progress;
  }
}

// Export singleton instance
module.exports = new LessonCompletionService();

