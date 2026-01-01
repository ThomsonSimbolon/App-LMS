const {
  LessonProgress,
  Lesson,
  Enrollment,
  Section,
  Course,
  User,
} = require("../models");
const activityLogService = require("../services/activityLogService");
const lessonCompletionService = require("../services/lessonCompletionService");

// Get lesson content
exports.getLessonContent = async (req, res) => {
  try {
    const { lessonId } = req.params;

    // Block ASSESSOR - Lesson access is for students/instructors only
    if (req.user.roleName === "ASSESSOR") {
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message:
          "ASSESSOR role cannot access lesson content. ASSESSOR is only responsible for certificate validation.",
      });
    }

    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Section,
          as: "section",
          include: [
            {
              model: Course,
              as: "course",
              attributes: ["id", "requireSequentialCompletion"],
            },
          ],
        },
      ],
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    // INSTRUCTOR (course owner) can always view lesson content
    const isCourseInstructor =
      lesson.section.course.instructorId === req.user.userId;
    const isAdmin =
      req.user.roleName === "ADMIN" || req.user.roleName === "SUPER_ADMIN";

    // Check if user is enrolled (for STUDENT role)
    let enrollment = null;
    if (!isCourseInstructor && !isAdmin) {
      enrollment = await Enrollment.findOne({
        where: {
          userId: req.user.userId,
          courseId: lesson.section.course.id,
          status: "ACTIVE",
        },
      });

      if (!enrollment && !lesson.isFree) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
          message: "You must be enrolled to access this lesson",
        });
      }
    }

    // Check lesson lock for sequential completion (only for students)
    if (!isCourseInstructor && !isAdmin && enrollment && lesson.section.course.requireSequentialCompletion) {
      // Free lessons are never locked
      if (!lesson.isFree) {
        // Get all lessons in course (sorted by section order, then lesson order)
        const allSections = await Section.findAll({
          where: { courseId: lesson.section.course.id },
          include: [{
            model: Lesson,
            as: 'lessons',
            order: [['order', 'ASC']],
            attributes: ['id', 'order', 'isFree']
          }],
          order: [['order', 'ASC']]
        });

        // Flatten lessons
        const allLessonsFlat = [];
        allSections.forEach(section => {
          section.lessons.forEach(l => {
            allLessonsFlat.push({
              id: l.id,
              order: l.order,
              isFree: l.isFree,
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

        // Get lesson progress
        const lessonProgress = await LessonProgress.findAll({
          where: { enrollmentId: enrollment.id }
        });

        // Find current lesson index
        const currentIndex = allLessonsFlat.findIndex(l => l.id === lesson.id);

        // Check if previous lessons are completed
        if (currentIndex > 0) {
          for (let i = 0; i < currentIndex; i++) {
            const previousLesson = allLessonsFlat[i];
            
            // Skip free lessons (they don't block)
            if (previousLesson.isFree) {
              continue;
            }

            // Check if previous lesson is completed
            const previousProgress = lessonProgress.find(p => p.lessonId === previousLesson.id);
            if (!previousProgress || !previousProgress.isCompleted) {
              return res.status(403).json({
                success: false,
                error: "Lesson locked",
                message: "You must complete the previous lessons in order to access this lesson"
              });
            }
          }
        }
      }
    }

    // Update last accessed
    if (enrollment) {
      await enrollment.update({
        lastAccessedLessonId: lessonId,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        type: lesson.type,
        content: lesson.content, // JSON object
        duration: lesson.duration,
        isRequired: lesson.isRequired,
        isFree: lesson.isFree,
        order: lesson.order,
      },
    });
  } catch (error) {
    console.error("Get lesson content error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Mark lesson as complete
exports.markLessonComplete = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { watchTime, submissionData } = req.body;

    // Block ASSESSOR - Lesson completion is for students only
    if (req.user.roleName === "ASSESSOR") {
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message:
          "ASSESSOR role cannot mark lessons as complete. ASSESSOR is only responsible for certificate validation.",
      });
    }

    // Only STUDENT can mark lessons as complete (not INSTRUCTOR/ADMIN)
    if (req.user.roleName !== "STUDENT") {
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message: "Only students can mark lessons as complete",
      });
    }

    // Get lesson with course info
    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Section,
          as: "section",
          attributes: ["courseId"],
        },
      ],
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      where: {
        userId: req.user.userId,
        courseId: lesson.section.courseId,
        status: "ACTIVE",
      },
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message: "You must be enrolled to complete this lesson",
      });
    }

    // Use LessonCompletionService to mark lesson as complete
    const result = await lessonCompletionService.markComplete(
      lessonId,
      req.user.userId,
      {
        watchTime,
        submissionData,
      }
    );

    // Log lesson completion activity (non-blocking)
    const user = await User.findByPk(req.user.userId);
    const lessonForLog = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Section,
          as: "section",
          attributes: ["courseId"],
        },
      ],
    });

    if (user && lessonForLog) {
      const enrollmentForLog = await Enrollment.findOne({
        where: {
          userId: req.user.userId,
          courseId: lessonForLog.section.courseId,
          status: "ACTIVE",
        },
      });

      if (enrollmentForLog) {
        activityLogService
          .logLessonComplete(
            user,
            lessonForLog,
            { watchTime: watchTime || 0, enrollmentId: enrollmentForLog.id },
            req
          )
          .catch((err) => {
            console.error("Failed to log lesson completion activity:", err);
          });
      }
    }

    res.status(200).json({
      success: true,
      message: result.message || "Lesson marked as complete",
      data: result.progress,
    });
  } catch (error) {
    console.error("Mark complete error:", error);

    // Handle validation errors from service
    if (
      error.message.includes("must") ||
      error.message.includes("required") ||
      error.message.includes("must complete")
    ) {
      return res.status(400).json({
        success: false,
        error: "Completion requirement not met",
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Update watch time
exports.updateWatchTime = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { watchTime } = req.body;

    // Block ASSESSOR
    if (req.user.roleName === "ASSESSOR") {
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message: "ASSESSOR role cannot update lesson progress",
      });
    }

    if (watchTime === undefined) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Watch time is required",
      });
    }

    // Get lesson
    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Section,
          as: "section",
          attributes: ["courseId"],
        },
      ],
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      where: {
        userId: req.user.userId,
        courseId: lesson.section.courseId,
        status: "ACTIVE",
      },
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message: "You must be enrolled to track progress on this lesson",
      });
    }

    // Update or create progress
    const [progress] = await LessonProgress.findOrCreate({
      where: {
        enrollmentId: enrollment.id,
        lessonId,
      },
      defaults: { watchTime },
    });

    await progress.update({ watchTime });

    res.status(200).json({
      success: true,
      message: "Watch time updated",
      data: { watchTime: progress.watchTime },
    });
  } catch (error) {
    console.error("Update watch time error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};
