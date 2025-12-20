const { Lesson, Section, Course } = require('../models');
const cloudinaryService = require('../services/cloudinaryService');

// Create lesson
exports.createLesson = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { title, type, content, duration, order, isFree = false } = req.body;

    if (!title || !type) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Title and type are required'
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

    // Check permission
    if (section.course.instructorId !== req.user.userId && req.user.roleName !== 'ADMIN' && req.user.roleName !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get next order if not provided
    let lessonOrder = order;
    if (!lessonOrder) {
      const maxOrder = await Lesson.max('order', { where: { sectionId } });
      lessonOrder = (maxOrder || 0) + 1;
    }

    // Handle file upload based on type
    let contentUrl = content;

    if (req.file) {
      if (type === 'VIDEO') {
        const upload = await cloudinaryService.uploadVideo(req.file, 'lessons/videos');
        contentUrl = upload.url;
      } else if (type === 'PDF') {
        const upload = await cloudinaryService.uploadPDF(req.file, 'lessons/pdfs');
        contentUrl = upload.url;
      }
    }

    const lesson = await Lesson.create({
      sectionId,
      title,
      type,
      content: contentUrl,
      duration: duration || 0,
      order: lessonOrder,
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
    const { title, type, content, duration, order, isFree } = req.body;

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

    // Check permission
    if (lesson.section.course.instructorId !== req.user.userId && req.user.roleName !== 'ADMIN' && req.user.roleName !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const updates = {};
    if (title) updates.title = title;
    if (type) updates.type = type;
    if (content) updates.content = content;
    if (duration !== undefined) updates.duration = duration;
    if (order !== undefined) updates.order = order;
    if (isFree !== undefined) updates.isFree = isFree;

    // Handle file upload
    if (req.file) {
      if (type === 'VIDEO' || lesson.type === 'VIDEO') {
        const upload = await cloudinaryService.uploadVideo(req.file, 'lessons/videos');
        updates.content = upload.url;
      } else if (type === 'PDF' || lesson.type === 'PDF') {
        const upload = await cloudinaryService.uploadPDF(req.file, 'lessons/pdfs');
        updates.content = upload.url;
      }
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

    // Check permission
    if (lesson.section.course.instructorId !== req.user.userId && req.user.roleName !== 'ADMIN' && req.user.roleName !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
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
