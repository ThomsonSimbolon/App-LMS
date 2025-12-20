const { Enrollment, Course, User, LessonProgress, Lesson, Section, Category } = require('../models');
const { Op } = require('sequelize');

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

    // For paid courses, check payment (TODO: implement payment verification)
    if (course.type !== 'FREE') {
      // TODO: Verify payment before enrollment
      return res.status(402).json({
        success: false,
        error: 'Payment required',
        message: 'This is a paid course. Payment integration coming soon.'
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      userId: req.user.userId,
      courseId,
      status: 'ACTIVE',
      progress: 0
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
          as: 'course',
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
                  attributes: ['id', 'title', 'type', 'duration', 'order', 'isFree']
                }
              ]
            },
            {
              model: User,
              as: 'instructor',
              attributes: ['id', 'firstName', 'lastName']
            }
          ]
        }
      ]
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found'
      });
    }

    // Get lesson progress
    const lessonProgress = await LessonProgress.findAll({
      where: { enrollmentId }
    });

    // Add completion status to each lesson
    const course = enrollment.course.toJSON();
    course.sections = course.sections.map(section => ({
      ...section,
      lessons: section.lessons.map(lesson => {
        const progress = lessonProgress.find(p => p.lessonId === lesson.id);
        return {
          ...lesson,
          isCompleted: progress?.isCompleted || false,
          watchTime: progress?.watchTime || 0,
          isLocked: false // TODO: Implement lesson locking logic
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
          lastAccessedAt: enrollment.lastAccessedAt
        },
        course
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
