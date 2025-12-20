const { LessonProgress, Lesson, Enrollment, Section, Course } = require('../models');

// Get lesson content
exports.getLessonContent = async (req, res) => {
  try {
    const { lessonId } = req.params;

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
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      where: {
        userId: req.user.userId,
        courseId: lesson.section.course.id,
        status: 'ACTIVE'
      }
    });

    if (!enrollment && !lesson.isFree) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You must be enrolled to access this lesson'
      });
    }

    // TODO: Check if lesson is locked (previous lesson not completed)
    // For now, allow all lessons

    // Update last accessed
    if (enrollment) {
      await enrollment.update({
        lastAccessedLessonId: lessonId
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        content: lesson.content,
        duration: lesson.duration
      }
    });

  } catch (error) {
    console.error('Get lesson content error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Mark lesson as complete
exports.markLessonComplete = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { watchTime } = req.body;

    // Get lesson with course info
    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Section,
          as: 'section',
          attributes: ['courseId']
        }
      ]
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      where: {
        userId: req.user.userId,
        courseId: lesson.section.courseId,
        status: 'ACTIVE'
      }
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You must be enrolled to complete this lesson'
      });
    }

    // Create or update lesson progress
    const [progress, created] = await LessonProgress.findOrCreate({
      where: {
        enrollmentId: enrollment.id,
        lessonId
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
        watchTime: watchTime || progress.watchTime
      });
    }

    // Recalculate enrollment progress
    await updateEnrollmentProgress(enrollment.id);

    res.status(200).json({
      success: true,
      message: 'Lesson marked as complete',
      data: progress
    });

  } catch (error) {
    console.error('Mark complete error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Update watch time
exports.updateWatchTime = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { watchTime } = req.body;

    if (watchTime === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Watch time is required'
      });
    }

    // Get lesson
    const lesson = await Lesson.findByPk(lessonId, {
      include: [{
        model: Section,
        as: 'section',
        attributes: ['courseId']
      }]
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      where: {
        userId: req.user.userId,
        courseId: lesson.section.courseId
      }
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Update or create progress
    const [progress] = await LessonProgress.findOrCreate({
      where: {
        enrollmentId: enrollment.id,
        lessonId
      },
      defaults: { watchTime }
    });

    await progress.update({ watchTime });

    res.status(200).json({
      success: true,
      message: 'Watch time updated',
      data: { watchTime: progress.watchTime }
    });

  } catch (error) {
    console.error('Update watch time error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Helper function to recalculate enrollment progress
async function updateEnrollmentProgress(enrollmentId) {
  const enrollment = await Enrollment.findByPk(enrollmentId);
  
  // Get total lessons
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

