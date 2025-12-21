const { Lesson, Section, Course } = require('../models');
const cloudinaryService = require('../services/cloudinaryService');

// Create lesson
exports.createLesson = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { title, description, type, content, duration, order, isRequired = true, isFree = false } = req.body;

    // Block ASSESSOR - Lesson creation is academic domain, only INSTRUCTOR allowed
    if (req.user.roleName === 'ASSESSOR') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'ASSESSOR role cannot create lessons. Only INSTRUCTOR can create academic content.'
      });
    }

    if (!title || !type) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Title and type are required'
      });
    }

    // Validate lesson type
    const validTypes = ['VIDEO', 'MATERIAL', 'LIVE_SESSION', 'ASSIGNMENT', 'QUIZ', 'EXAM', 'DISCUSSION'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: `Invalid lesson type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Check if section exists
    const section = await Section.findByPk(sectionId, {
      include: [{ model: Course, as: 'course' }]
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }

    // Check permission - Only INSTRUCTOR (owner) or ADMIN/SUPER_ADMIN can create lessons
    if (section.course.instructorId !== req.user.userId && req.user.roleName !== 'ADMIN' && req.user.roleName !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Only course instructor or administrators can create lessons'
      });
    }

    // Get next order if not provided
    let lessonOrder = order;
    if (!lessonOrder) {
      const maxOrder = await Lesson.max('order', { where: { sectionId } });
      lessonOrder = (maxOrder || 0) + 1;
    }

    // Handle content - can be JSON object or handle file uploads
    let lessonContent = content;

    // Handle file upload for VIDEO and MATERIAL types
    if (req.file) {
      if (type === 'VIDEO') {
        const upload = await cloudinaryService.uploadVideo(req.file, 'lessons/videos');
        lessonContent = {
          videoUrl: upload.url,
          duration: duration || 0,
          minWatchPercentage: 80
        };
      } else if (type === 'MATERIAL') {
        const upload = await cloudinaryService.uploadPDF(req.file, 'lessons/materials');
        lessonContent = {
          fileUrl: upload.url,
          fileType: 'PDF'
        };
      }
    } else if (content && typeof content === 'string') {
      // If content is string, try to parse as JSON, otherwise wrap it
      try {
        lessonContent = JSON.parse(content);
      } catch (e) {
        // If not JSON, wrap it based on type
        if (type === 'VIDEO') {
          lessonContent = { videoUrl: content, duration: duration || 0, minWatchPercentage: 80 };
        } else if (type === 'MATERIAL') {
          lessonContent = { fileUrl: content, fileType: 'PDF' };
        } else {
          lessonContent = { content: content };
        }
      }
    } else if (content && typeof content === 'object') {
      // Content is already an object, use it directly
      lessonContent = content;
    }

    const lesson = await Lesson.create({
      sectionId,
      title,
      description: description || null,
      type,
      content: lessonContent,
      duration: duration || 0,
      order: lessonOrder,
      isRequired: isRequired !== undefined ? isRequired : true,
      isFree
    });

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: lesson
    });

  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Update lesson
exports.updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, content, duration, order, isRequired, isFree } = req.body;

    // Block ASSESSOR - Lesson update is academic domain, only INSTRUCTOR allowed
    if (req.user.roleName === 'ASSESSOR') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'ASSESSOR role cannot update lessons. Only INSTRUCTOR can modify academic content.'
      });
    }

    const lesson = await Lesson.findByPk(id, {
      include: [{
        model: Section,
        as: 'section',
        include: [{ model: Course, as: 'course' }]
      }]
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    // Check permission - Only INSTRUCTOR (owner) or ADMIN/SUPER_ADMIN can update lessons
    if (lesson.section.course.instructorId !== req.user.userId && req.user.roleName !== 'ADMIN' && req.user.roleName !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Only course instructor or administrators can update lessons'
      });
    }

    // Validate lesson type if provided
    if (type) {
      const validTypes = ['VIDEO', 'MATERIAL', 'LIVE_SESSION', 'ASSIGNMENT', 'QUIZ', 'EXAM', 'DISCUSSION'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: `Invalid lesson type. Must be one of: ${validTypes.join(', ')}`
      });
      }
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (type !== undefined) updates.type = type;
    if (duration !== undefined) updates.duration = duration;
    if (order !== undefined) updates.order = order;
    if (isRequired !== undefined) updates.isRequired = isRequired;
    if (isFree !== undefined) updates.isFree = isFree;

    // Handle content update
    const updateType = type || lesson.type;
    let lessonContent = content;

    // Handle file upload for VIDEO and MATERIAL types
    if (req.file) {
      if (updateType === 'VIDEO') {
        const upload = await cloudinaryService.uploadVideo(req.file, 'lessons/videos');
        lessonContent = {
          videoUrl: upload.url,
          duration: duration !== undefined ? duration : lesson.duration || 0,
          minWatchPercentage: lesson.content?.minWatchPercentage || 80
        };
      } else if (updateType === 'MATERIAL') {
        const upload = await cloudinaryService.uploadPDF(req.file, 'lessons/materials');
        lessonContent = {
          fileUrl: upload.url,
          fileType: 'PDF'
        };
      }
    } else if (content !== undefined) {
      if (typeof content === 'string') {
        // Try to parse as JSON, otherwise wrap it
        try {
          lessonContent = JSON.parse(content);
        } catch (e) {
          // If not JSON, wrap it based on type
          if (updateType === 'VIDEO') {
            lessonContent = { videoUrl: content, duration: duration !== undefined ? duration : lesson.duration || 0, minWatchPercentage: 80 };
          } else if (updateType === 'MATERIAL') {
            lessonContent = { fileUrl: content, fileType: 'PDF' };
          } else {
            lessonContent = { content: content };
          }
        }
      } else if (typeof content === 'object') {
        lessonContent = content;
      }
    }

    if (lessonContent !== undefined) {
      updates.content = lessonContent;
    }

    await lesson.update(updates);

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      data: lesson
    });

  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Delete lesson
exports.deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    // Block ASSESSOR - Lesson deletion is academic domain, only INSTRUCTOR allowed
    if (req.user.roleName === 'ASSESSOR') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'ASSESSOR role cannot delete lessons. Only INSTRUCTOR can delete academic content.'
      });
    }

    const lesson = await Lesson.findByPk(id, {
      include: [{
        model: Section,
        as: 'section',
        include: [{ model: Course, as: 'course' }]
      }]
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    // Check permission - Only INSTRUCTOR (owner) or ADMIN/SUPER_ADMIN can delete lessons
    if (lesson.section.course.instructorId !== req.user.userId && req.user.roleName !== 'ADMIN' && req.user.roleName !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Only course instructor or administrators can delete lessons'
      });
    }

    await lesson.destroy();

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully'
    });

  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};
