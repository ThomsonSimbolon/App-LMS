const { Section, Course, Lesson } = require('../models');

// Create section
exports.createSection = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, order } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Section title is required'
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

    // Check permission (must be course owner or admin)
    if (course.instructorId !== req.user.userId && req.user.roleName !== 'ADMIN' && req.user.roleName !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only add sections to your own courses'
      });
    }

    // Get next order if not provided
    let sectionOrder = order;
    if (!sectionOrder) {
      const maxOrder = await Section.max('order', { where: { courseId } });
      sectionOrder = (maxOrder || 0) + 1;
    }

    const section = await Section.create({
      courseId,
      title,
      order: sectionOrder
    });

    res.status(201).json({
      success: true,
      message: 'Section created successfully',
      data: section
    });

  } catch (error) {
    console.error('Create section error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Update section
exports.updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, order } = req.body;

    const section = await Section.findByPk(id, {
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

    const updates = {};
    if (title) updates.title = title;
    if (order !== undefined) updates.order = order;

    await section.update(updates);

    res.status(200).json({
      success: true,
      message: 'Section updated successfully',
      data: section
    });

  } catch (error) {
    console.error('Update section error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Delete section
exports.deleteSection = async (req, res) => {
  try {
    const { id } = req.params;

    const section = await Section.findByPk(id, {
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

    await section.destroy();

    res.status(200).json({
      success: true,
      message: 'Section deleted successfully'
    });

  } catch (error) {
    console.error('Delete section error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};
