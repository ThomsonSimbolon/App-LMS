const { Course, User, Role, CourseAssessor } = require('../models');
const activityLogService = require('../services/activityLogService');

/**
 * Assign assessor(s) to course
 * POST /api/courses/:courseId/assessors
 * Authorization: ADMIN, SUPER_ADMIN
 * 
 * Business Rules:
 * - Replaces existing assignments (sync operation)
 * - Only users with ASSESSOR role can be assigned
 * - Validates assessor IDs exist and are ASSESSOR role
 */
exports.assignAssessors = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { assessorIds } = req.body;

    // Validation
    if (!assessorIds || !Array.isArray(assessorIds)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'assessorIds must be an array'
      });
    }

    // Get course
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Get ASSESSOR role
    const assessorRole = await Role.findOne({ where: { name: 'ASSESSOR' } });
    if (!assessorRole) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'ASSESSOR role not found in database'
      });
    }

    // Validate all assessor IDs exist and are ASSESSOR role
    if (assessorIds.length > 0) {
      const assessors = await User.findAll({
        where: {
          id: assessorIds,
          roleId: assessorRole.id
        }
      });

      if (assessors.length !== assessorIds.length) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'One or more assessor IDs are invalid or not ASSESSOR role'
        });
      }
    }

    // Get current admin user for activity logging
    const adminUser = await User.findByPk(req.user.userId);

    // Transaction: Replace existing assignments
    const transaction = await CourseAssessor.sequelize.transaction();

    try {
      // Remove existing assignments
      await CourseAssessor.destroy({
        where: { courseId },
        transaction
      });

      // Create new assignments
      const assignments = assessorIds.map(assessorId => ({
        courseId,
        assessorId
      }));

      if (assignments.length > 0) {
        await CourseAssessor.bulkCreate(assignments, { transaction });

        // Log assignment for each assessor (non-blocking)
        for (const assessorId of assessorIds) {
          const assessor = await User.findByPk(assessorId);
          if (assessor) {
            activityLogService.logAssessorAssigned(adminUser, course, assessor, req).catch(err => {
              console.error('Failed to log assessor assignment:', err);
            });
          }
        }
      }

      await transaction.commit();

      // Fetch updated assessors list
      const updatedAssessors = await CourseAssessor.findAll({
        where: { courseId },
        include: [
          {
            model: User,
            as: 'assessor',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            include: [
              {
                model: Role,
                as: 'role',
                attributes: ['id', 'name']
              }
            ]
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Assessors assigned successfully',
        data: {
          courseId: course.id,
          courseTitle: course.title,
          assessors: updatedAssessors.map(ca => ({
            id: ca.assessor.id,
            firstName: ca.assessor.firstName,
            lastName: ca.assessor.lastName,
            email: ca.assessor.email,
            role: ca.assessor.role.name,
            assignedAt: ca.createdAt
          }))
        }
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Assign assessors error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Get assigned assessors for a course
 * GET /api/courses/:courseId/assessors
 * Authorization: ADMIN, SUPER_ADMIN, INSTRUCTOR (own courses)
 */
exports.getAssignedAssessors = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Get course
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check permission: INSTRUCTOR can only view own courses
    if (req.user.roleName === 'INSTRUCTOR' && course.instructorId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only view assessors for your own courses'
      });
    }

    // Get assigned assessors
    const assignments = await CourseAssessor.findAll({
      where: { courseId },
      include: [
        {
          model: User,
          as: 'assessor',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          include: [
            {
              model: Role,
              as: 'role',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: {
        courseId: course.id,
        courseTitle: course.title,
        assessors: assignments.map(ca => ({
          id: ca.assessor.id,
          firstName: ca.assessor.firstName,
          lastName: ca.assessor.lastName,
          email: ca.assessor.email,
          role: ca.assessor.role.name,
          assignedAt: ca.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Get assigned assessors error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

