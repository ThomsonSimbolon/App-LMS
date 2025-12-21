const { User, Course, Enrollment, Role } = require('../models');

// Get admin dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.count();

    // Get total courses count (published)
    const totalCourses = await Course.count({
      where: { isPublished: true }
    });

    // Get total enrollments count
    const totalEnrollments = await Enrollment.count();

    // Get active instructors count (users with INSTRUCTOR role)
    const instructorRole = await Role.findOne({ where: { name: 'INSTRUCTOR' } });
    const activeInstructors = instructorRole 
      ? await User.count({ where: { roleId: instructorRole.id } })
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        activeInstructors
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

