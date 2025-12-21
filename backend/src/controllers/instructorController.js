const { Enrollment, Course, User, LessonProgress, Lesson, Section } = require('../models');
const { Op } = require('sequelize');

/**
 * Get instructor dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const instructorId = req.user.userId;

    // Get total courses by instructor
    const totalCourses = await Course.count({
      where: { instructorId }
    });

    // Get all courses by instructor
    const courses = await Course.findAll({
      where: { instructorId },
      attributes: ['id']
    });

    const courseIds = courses.map(c => c.id);

    // Get total unique students across all courses
    let totalStudents = 0;
    if (courseIds.length > 0) {
      const enrollments = await Enrollment.findAll({
        where: {
          courseId: { [Op.in]: courseIds },
          status: { [Op.in]: ['ACTIVE', 'COMPLETED'] }
        },
        attributes: ['userId'],
        raw: true
      });
      const uniqueStudentIds = [...new Set(enrollments.map(e => e.userId))];
      totalStudents = uniqueStudentIds.length;
    }

    // Get total reviews (for now, set to 0 - can be enhanced with reviews table if available)
    const totalReviews = 0;

    // Get average rating (for now, set to 0 - can be enhanced with ratings table if available)
    const averageRating = 0;

    res.status(200).json({
      success: true,
      data: {
        totalCourses,
        totalStudents,
        totalReviews,
        averageRating
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

/**
 * Get students enrolled in instructor's courses
 */
exports.getMyStudents = async (req, res) => {
  try {
    const { search, courseId, page = 1, limit = 10 } = req.query;
    const instructorId = req.user.userId;
    const offset = (page - 1) * limit;

    // Build where clause for courses
    const courseWhere = { instructorId };
    if (courseId) {
      courseWhere.id = courseId;
    }

    // Build where clause for enrollments
    const enrollmentWhere = { status: { [Op.in]: ['ACTIVE', 'COMPLETED'] } };

    // Build include conditions for search
    let userWhere = {};
    let courseWhereWithSearch = { ...courseWhere };
    
    if (search) {
      userWhere[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { [Op.and]: [
          { firstName: { [Op.like]: `%${search.split(' ')[0]}%` } },
          { lastName: { [Op.like]: `%${search.split(' ')[1] || ''}%` } }
        ]}
      ];
      courseWhereWithSearch.title = { [Op.like]: `%${search}%` };
    }

    // Get enrollments for instructor's courses
    const { count, rows: enrollments } = await Enrollment.findAndCountAll({
      where: enrollmentWhere,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['enrolledAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
          required: true
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title'],
          where: search ? courseWhereWithSearch : courseWhere,
          required: true
        }
      ],
      distinct: true
    });

    // Format response
    const students = enrollments.map(enrollment => ({
      id: enrollment.student.id,
      name: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
      email: enrollment.student.email,
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title
      },
      progress: parseFloat(enrollment.progress) || 0,
      joinedAt: enrollment.enrolledAt || enrollment.createdAt,
      enrollmentId: enrollment.id
    }));

    res.status(200).json({
      success: true,
      data: {
        students,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get my students error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Get instructor analytics
 */
exports.getMyAnalytics = async (req, res) => {
  try {
    const instructorId = req.user.userId;

    // Get all courses by instructor
    const courses = await Course.findAll({
      where: { instructorId },
      attributes: ['id', 'title', 'isPublished']
    });

    const courseIds = courses.map(c => c.id);

    if (courseIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          stats: {
            totalStudents: 0,
            avgRating: 0,
            completionRate: 0,
            totalRevenue: 0
          },
          trends: {
            enrollmentGrowth: [],
            engagement: { active: 0, completed: 0, dropped: 0 }
          },
          changes: {
            totalStudents: { value: '0%', trend: 'up' },
            avgRating: { value: '0', trend: 'up' },
            completionRate: { value: '0%', trend: 'up' },
            totalRevenue: { value: '$0', trend: 'up' }
          }
        }
      });
    }

    // Get all enrollments for instructor's courses
    const enrollments = await Enrollment.findAll({
      where: {
        courseId: { [Op.in]: courseIds }
      },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id']
        }
      ]
    });

    // Calculate total unique students
    const uniqueStudentIds = [...new Set(enrollments.map(e => e.userId))];
    const totalStudents = uniqueStudentIds.length;

    // Calculate completion rate (average progress across all enrollments)
    const totalProgress = enrollments.reduce((sum, e) => sum + parseFloat(e.progress || 0), 0);
    const completionRate = enrollments.length > 0 
      ? Math.round(totalProgress / enrollments.length) 
      : 0;

    // Calculate engagement stats
    const active = enrollments.filter(e => e.status === 'ACTIVE').length;
    const completed = enrollments.filter(e => e.status === 'COMPLETED').length;
    const dropped = enrollments.filter(e => e.status === 'DROPPED').length;

    // Calculate enrollment growth (last 12 months)
    const now = new Date();
    const enrollmentGrowth = [];
    
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      
      const count = enrollments.filter(e => {
        const enrolledDate = new Date(e.enrolledAt || e.createdAt);
        return enrolledDate >= monthStart && enrolledDate <= monthEnd;
      }).length;

      enrollmentGrowth.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count
      });
    }

    // Calculate previous month stats for trend comparison
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const currentMonthEnrollments = enrollments.filter(e => {
      const enrolledDate = new Date(e.enrolledAt || e.createdAt);
      return enrolledDate >= currentMonthStart;
    }).length;

    const previousMonthEnrollments = enrollments.filter(e => {
      const enrolledDate = new Date(e.enrolledAt || e.createdAt);
      return enrolledDate >= previousMonthStart && enrolledDate <= previousMonthEnd;
    }).length;

    const previousMonthUniqueStudents = [...new Set(
      enrollments
        .filter(e => {
          const enrolledDate = new Date(e.enrolledAt || e.createdAt);
          return enrolledDate >= previousMonthStart && enrolledDate <= previousMonthEnd;
        })
        .map(e => e.userId)
    )].length;

    // Calculate trends
    const studentChange = previousMonthUniqueStudents > 0
      ? Math.round(((totalStudents - previousMonthUniqueStudents) / previousMonthUniqueStudents) * 100)
      : totalStudents > 0 ? 100 : 0;

    const enrollmentChange = previousMonthEnrollments > 0
      ? Math.round(((currentMonthEnrollments - previousMonthEnrollments) / previousMonthEnrollments) * 100)
      : currentMonthEnrollments > 0 ? 100 : 0;

    // For now, rating and revenue are set to 0 (can be enhanced later)
    const avgRating = 0; // TODO: Calculate from reviews/ratings if available
    const totalRevenue = 0; // TODO: Calculate from payment system if available

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          avgRating,
          completionRate,
          totalRevenue
        },
        trends: {
          enrollmentGrowth,
          engagement: {
            active,
            completed,
            dropped
          }
        },
        changes: {
          totalStudents: {
            value: `${studentChange >= 0 ? '+' : ''}${studentChange}%`,
            trend: studentChange >= 0 ? 'up' : 'down'
          },
          avgRating: {
            value: '+0',
            trend: 'up'
          },
          completionRate: {
            value: `${enrollmentChange >= 0 ? '+' : ''}${enrollmentChange}%`,
            trend: enrollmentChange >= 0 ? 'up' : 'down'
          },
          totalRevenue: {
            value: '+0%',
            trend: 'up'
          }
        }
      }
    });

  } catch (error) {
    console.error('Get my analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

