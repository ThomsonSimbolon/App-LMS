const { Enrollment, Course, User, LessonProgress, Lesson, Section, Category } = require('../models');
const { Op } = require('sequelize');
const activityLogService = require('../services/activityLogService');
const notificationService = require('../services/notificationService');

/**
 * Check if a lesson is locked based on sequential completion requirement
 * @param {Object} lesson - Lesson object with section info
 * @param {Array} allLessons - All lessons in course (flattened, sorted)
 * @param {Array} lessonProgress - All lesson progress for enrollment
 * @param {Object} course - Course object with requireSequentialCompletion
 * @returns {boolean} - True if lesson is locked
 */
function isLessonLocked(lesson, allLessons, lessonProgress, course) {
  // If course doesn't require sequential completion, no lessons are locked
  if (!course.requireSequentialCompletion) {
    return false;
  }

  // Free lessons are never locked
  if (lesson.isFree) {
    return false;
  }

  // Find current lesson index in flattened list
  const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
  
  // First lesson is never locked
  if (currentIndex === 0) {
    return false;
  }

  // Check all previous lessons (in order) are completed
  for (let i = 0; i < currentIndex; i++) {
    const previousLesson = allLessons[i];
    
    // Skip free lessons (they don't block)
    if (previousLesson.isFree) {
      continue;
    }

    // Check if previous lesson is completed
    const previousProgress = lessonProgress.find(p => p.lessonId === previousLesson.id);
    if (!previousProgress || !previousProgress.isCompleted) {
      return true; // Locked because previous lesson not completed
    }
  }

  return false; // Not locked
}

// Enroll in a course
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Course ID is required'
      });
    }

    // Check if course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if course is published
    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        error: 'Course not available',
        message: 'This course is not published yet'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: {
        userId: req.user.userId,
        courseId
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: 'Already enrolled',
        message: 'You are already enrolled in this course'
      });
    }

    // For paid courses, check payment verification
    if (course.type !== 'FREE') {
      const { PaymentIntent } = require('../models');
      const { Op } = require('sequelize');
      
      // Check if user has a succeeded payment intent for this course
      const paymentIntent = await PaymentIntent.findOne({
        where: {
          userId: req.user.userId,
          courseId,
          status: 'SUCCEEDED'
        }
      });

      if (!paymentIntent) {
        return res.status(402).json({
          success: false,
          error: 'Payment required',
          message: 'This is a paid course. Please complete payment first.',
          requiresPayment: true
        });
      }
    }

    // Create enrollment with course version
    const enrollment = await Enrollment.create({
      userId: req.user.userId,
      courseId,
      status: 'ACTIVE',
      progress: 0,
      courseVersion: course.version // Lock to current course version
    });

    // Fetch with relations
    const enrollmentData = await Enrollment.findByPk(enrollment.id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'thumbnail']
        }
      ]
    });

    // Log course enrollment activity (non-blocking)
    activityLogService.logCourseEnroll(req.user, course, req).catch(err => {
      console.error('Failed to log enrollment activity:', err);
    });

    // Send enrollment success notification (non-blocking)
    const io = req.app.locals.io;
    notificationService.notifyCourseEnrollment(req.user.userId, course, io).catch(err => {
      console.error('Failed to send enrollment notification:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: enrollmentData
    });

  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Get my enrollments
exports.getMyEnrollments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.userId };
    if (status) where.status = status;

    const { count, rows: enrollments } = await Enrollment.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['updatedAt', 'DESC']],
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description', 'thumbnail', 'level'],
          include: [
            {
              model: User,
              as: 'instructor',
              attributes: ['id', 'firstName', 'lastName']
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        enrollments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

    // Get learning page data
exports.getLearningData = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findOne({
      where: {
        id: enrollmentId,
        userId: req.user.userId
      },
      include: [
        {
          model: Course,
          as: 'course'
        }
      ]
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found'
      });
    }

    // If courseVersion is set, find course with that version
    // Otherwise, use the enrolled course (backward compatibility)
    let course;
    if (enrollment.courseVersion) {
      // Find course with matching version
      // Note: In a full implementation, you might want to track originalCourseId
      // For now, we'll use the enrolled courseId and check its version matches
      course = await Course.findByPk(enrollment.courseId);
      
      // If current course version doesn't match enrollment version, find the correct one
      // This is a simplified approach - in production, you might want a better versioning strategy
      if (course && course.version !== enrollment.courseVersion) {
        // Try to find course with matching version (by title/slug pattern)
        // For now, we'll use the enrolled course and log a warning
        console.warn(`Course version mismatch: enrollment expects ${enrollment.courseVersion}, course has ${course.version}`);
      }
    } else {
      // Backward compatibility: use enrolled course
      course = enrollment.course;
    }

    // If no course found, use enrolled course as fallback
    if (!course) {
      course = enrollment.course;
    }

    // Load course with all relations
    const courseWithRelations = await Course.findByPk(course.id, {
      include: [
        {
          model: Section,
          as: 'sections',
          order: [['order', 'ASC']],
          include: [
            {
              model: Lesson,
              as: 'lessons',
              order: [['order', 'ASC']],
              attributes: ['id', 'title', 'description', 'type', 'duration', 'order', 'isRequired', 'isFree']
            }
          ]
        },
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    // Get lesson progress
    const lessonProgress = await LessonProgress.findAll({
      where: { enrollmentId }
    });

    // Flatten all lessons for sequential checking (across sections)
    const allLessonsFlat = [];
    courseWithRelations.sections.forEach(section => {
      section.lessons.forEach(lesson => {
        allLessonsFlat.push({
          id: lesson.id,
          sectionId: lesson.sectionId,
          order: lesson.order,
          isFree: lesson.isFree,
          sectionOrder: section.order
        });
      });
    });

    // Sort by section order, then lesson order
    allLessonsFlat.sort((a, b) => {
      if (a.sectionOrder !== b.sectionOrder) {
        return a.sectionOrder - b.sectionOrder;
      }
      return a.order - b.order;
    });

    // Add completion status and locking to each lesson
    const courseData = courseWithRelations.toJSON();
    courseData.sections = courseData.sections.map(section => ({
      ...section,
      lessons: section.lessons.map(lesson => {
        const progress = lessonProgress.find(p => p.lessonId === lesson.id);
        const isLocked = isLessonLocked(
          lesson,
          allLessonsFlat,
          lessonProgress,
          courseWithRelations
        );
        return {
          ...lesson,
          isCompleted: progress?.isCompleted || false,
          watchTime: progress?.watchTime || 0,
          isLocked
        };
      })
    }));

    res.status(200).json({
      success: true,
      data: {
        enrollment: {
          id: enrollment.id,
          progress: enrollment.progress,
          status: enrollment.status,
          lastAccessedAt: enrollment.lastAccessedAt,
          courseVersion: enrollment.courseVersion || courseWithRelations.version
        },
        course: courseData
      }
    });

  } catch (error) {
    console.error('Get learning data error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Get enrollment progress/stats
exports.getEnrollmentProgress = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findOne({
      where: {
        id: enrollmentId,
        userId: req.user.userId
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ]
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found'
      });
    }

    // Get all lessons for this course
    const totalLessons = await Lesson.count({
      include: [{
        model: Section,
        as: 'section',
        where: { courseId: enrollment.courseId }
      }]
    });

    // Get completed lessons
    const completedLessons = await LessonProgress.count({
      where: {
        enrollmentId,
        isCompleted: true
      }
    });

    // Calculate total watch time
    const watchTimeData = await LessonProgress.sum('watchTime', {
      where: { enrollmentId }
    });

    const totalWatchTime = watchTimeData || 0;

    res.status(200).json({
      success: true,
      data: {
        enrollmentId: enrollment.id,
        courseId: enrollment.courseId,
        courseTitle: enrollment.course.title,
        progress: enrollment.progress,
        status: enrollment.status,
        stats: {
          totalLessons,
          completedLessons,
          remainingLessons: totalLessons - completedLessons,
          totalWatchTime,
          completionRate: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
        }
      }
    });

  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Unenroll from course
exports.unenrollCourse = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findOne({
      where: {
        id: enrollmentId,
        userId: req.user.userId
      }
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found'
      });
    }

    // Update status instead of deleting (to preserve history)
    await enrollment.update({ status: 'DROPPED' });

    res.status(200).json({
      success: true,
      message: 'Successfully unenrolled from course'
    });

  } catch (error) {
    console.error('Unenroll error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};
