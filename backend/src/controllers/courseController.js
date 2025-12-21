const {
  Course,
  Category,
  User,
  Section,
  Lesson,
  Enrollment,
} = require("../models");
const { Op } = require("sequelize");
const localFileService = require("../services/localFileService");
const courseVersionService = require("../services/courseVersionService");

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      categoryId,
      level,
      type,
      search,
      sort = "newest",
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const where = { isPublished: true };

    if (categoryId) where.categoryId = categoryId;
    if (level) where.level = level;
    if (type) where.type = type;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Build order clause
    let order = [["createdAt", "DESC"]]; // default: newest
    if (sort === "title") order = [["title", "ASC"]];
    if (sort === "popular") order = []; // Will sort by enrollment count (needs subquery or virtual field)

    const { count, rows: courses } = await Course.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
        {
          model: User,
          as: "instructor",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      attributes: {
        exclude: ["categoryId", "instructorId"],
      },
    });

    // Add enrollment count and rating (mock for now, can optimize later)
    const coursesWithStats = courses.map((course) => ({
      ...course.toJSON(),
      enrollmentCount: 0, // TODO: Calculate from enrollments table
      rating: 0, // TODO: Calculate from ratings
      isEnrolled: false, // TODO: Check if current user is enrolled
    }));

    res.status(200).json({
      success: true,
      data: {
        courses: coursesWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Get all courses for admin (includes unpublished)
exports.getAllCoursesAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      categoryId,
      level,
      type,
      search,
      sort = "newest",
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause - NO isPublished filter for admin
    const where = {};

    if (categoryId) where.categoryId = categoryId;
    if (level) where.level = level;
    if (type) where.type = type;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Build order clause
    let order = [["createdAt", "DESC"]]; // default: newest
    if (sort === "title") order = [["title", "ASC"]];
    if (sort === "popular") order = []; // Will sort by enrollment count (needs subquery or virtual field)

    const { count, rows: courses } = await Course.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
        {
          model: User,
          as: "instructor",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      attributes: {
        exclude: ["categoryId", "instructorId"],
      },
    });

    res.status(200).json({
      success: true,
      data: {
        courses: courses.map((course) => course.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all courses (admin) error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Get my courses (Instructor)
exports.getMyCourses = async (req, res) => {
  try {
    const { page = 1, limit = 12, search } = req.query;
    const offset = (page - 1) * limit;

    const where = { instructorId: req.user.userId };

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: courses } = await Course.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [
        { model: Category, as: "category", attributes: ["id", "name"] },
      ],
    });

    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get my courses error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
        {
          model: User,
          as: "instructor",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: Section,
          as: "sections",
          order: [["order", "ASC"]],
          include: [
            {
              model: Lesson,
              as: "lessons",
              order: [["order", "ASC"]],
              attributes: [
                "id",
                "title",
                "description",
                "type",
                "duration",
                "order",
                "isRequired",
                "isFree",
              ],
            },
          ],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Calculate stats
    const totalLessons = course.sections.reduce(
      (acc, section) => acc + section.lessons.length,
      0
    );
    const totalDuration = course.sections.reduce(
      (acc, section) =>
        acc +
        section.lessons.reduce(
          (sum, lesson) => sum + (lesson.duration || 0),
          0
        ),
      0
    );

    const courseData = {
      ...course.toJSON(),
      stats: {
        totalLessons,
        totalDuration,
        enrollmentCount: 0, // TODO
        completionRate: 0, // TODO
      },
      isEnrolled: false, // TODO: Check if current user is enrolled
    };

    res.status(200).json({
      success: true,
      data: courseData,
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Create course (Instructor/Admin)
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      categoryId,
      level = "BEGINNER",
      type = "FREE",
      price = 0,
      requireSequentialCompletion = false,
      requireManualApproval = false,
      instructorId, // Optional: Admin can assign instructor when creating course
    } = req.body;

    // Validation
    if (!title || !categoryId) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Title and category are required",
      });
    }

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Invalid category ID",
      });
    }

    // Determine instructorId based on role
    let finalInstructorId = req.user.userId; // Default: current user

    // If admin provides instructorId, validate it
    if (instructorId) {
      // Only ADMIN and SUPER_ADMIN can assign instructor
      if (
        req.user.roleName !== "ADMIN" &&
        req.user.roleName !== "SUPER_ADMIN"
      ) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
          message: "Only admin can assign instructor to course",
        });
      }

      // Validate instructor exists and has INSTRUCTOR role
      const { Role } = require("../models");
      const instructorRole = await Role.findOne({
        where: { name: "INSTRUCTOR" },
      });
      if (!instructorRole) {
        return res.status(500).json({
          success: false,
          error: "Internal server error",
          message: "INSTRUCTOR role not found",
        });
      }

      const instructor = await User.findOne({
        where: { id: instructorId, roleId: instructorRole.id },
      });

      if (!instructor) {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          message: "Invalid instructor ID or user is not an instructor",
        });
      }

      finalInstructorId = instructorId;
    }

    // Generate slug
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    // Upload thumbnail if provided
    let thumbnailUrl = null;
    if (req.file) {
      const upload = await localFileService.uploadImage(
        req.file,
        "course-thumbnails"
      );
      thumbnailUrl = upload.url;
    }

    // Create course
    const course = await Course.create({
      title,
      slug,
      description,
      thumbnail: thumbnailUrl,
      categoryId,
      instructorId: finalInstructorId,
      level,
      type,
      price: type === "FREE" ? 0 : price,
      requireSequentialCompletion,
      requireManualApproval,
      isPublished: false,
    });

    // Fetch with relations
    const createdCourse = await Course.findByPk(course.id, {
      include: [
        { model: Category, as: "category", attributes: ["id", "name"] },
        {
          model: User,
          as: "instructor",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: createdCourse,
    });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Update course (Instructor - own courses, Admin - any)
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      categoryId,
      level,
      type,
      price,
      requireSequentialCompletion,
      requireManualApproval,
    } = req.body;

    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Check permission (must be course owner or admin)
    if (
      course.instructorId !== req.user.userId &&
      req.user.roleName !== "ADMIN" &&
      req.user.roleName !== "SUPER_ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message: "You can only update your own courses",
      });
    }

    // Update fields
    const updates = {};
    if (title) {
      updates.title = title;
      updates.slug = title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
    }
    if (description !== undefined) updates.description = description;
    if (categoryId) updates.categoryId = categoryId;
    if (level) updates.level = level;
    if (type) updates.type = type;
    if (price !== undefined) updates.price = type === "FREE" ? 0 : price;
    if (requireSequentialCompletion !== undefined)
      updates.requireSequentialCompletion = requireSequentialCompletion;
    if (requireManualApproval !== undefined)
      updates.requireManualApproval = requireManualApproval;

    // Handle thumbnail upload
    if (req.file) {
      const upload = await localFileService.uploadImage(
        req.file,
        "course-thumbnails"
      );
      updates.thumbnail = upload.url;

      // Delete old thumbnail if exists
      if (course.thumbnail && course.thumbnail.startsWith("/uploads/")) {
        try {
          await localFileService.deleteFile(course.thumbnail);
        } catch (error) {
          console.error("Error deleting old thumbnail:", error);
        }
      }
    }

    await course.update(updates);

    // Fetch updated course
    const updatedCourse = await Course.findByPk(id, {
      include: [
        { model: Category, as: "category" },
        {
          model: User,
          as: "instructor",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Delete course (Admin/Super Admin only - can delete any course)
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Only ADMIN and SUPER_ADMIN can delete courses through this endpoint
    // This check is redundant since route middleware already enforces this,
    // but kept for extra security
    if (req.user.roleName !== "ADMIN" && req.user.roleName !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message: "Only administrators can delete courses",
      });
    }

    await course.destroy();

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Assign instructor to course (Admin only)
exports.assignInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const { instructorId } = req.body;

    // Validation: instructorId is required
    if (!instructorId) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: "instructorId is required",
      });
    }

    // Get course
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Validate instructor exists and has INSTRUCTOR role
    const { Role } = require("../models");
    const instructorRole = await Role.findOne({
      where: { name: "INSTRUCTOR" },
    });
    if (!instructorRole) {
      return res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "INSTRUCTOR role not found",
      });
    }

    const instructor = await User.findOne({
      where: { id: instructorId, roleId: instructorRole.id },
      attributes: ["id", "firstName", "lastName", "email"],
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!instructor) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Invalid instructor ID or user is not an instructor",
      });
    }

    // Update course instructorId
    await course.update({ instructorId });

    // Fetch updated course with relations
    const updatedCourse = await Course.findByPk(id, {
      include: [
        { model: Category, as: "category", attributes: ["id", "name"] },
        {
          model: User,
          as: "instructor",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Instructor assigned successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Assign instructor error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Delete my course (Instructor only - can only delete own courses)
exports.deleteMyCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Instructor can only delete their own courses
    if (course.instructorId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message: "You can only delete your own courses",
      });
    }

    await course.destroy();

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete my course error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Publish/Unpublish course
exports.togglePublish = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Check permission
    if (
      course.instructorId !== req.user.userId &&
      req.user.roleName !== "ADMIN" &&
      req.user.roleName !== "SUPER_ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    await course.update({
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    });

    res.status(200).json({
      success: true,
      message: `Course ${
        isPublished ? "published" : "unpublished"
      } successfully`,
      data: course,
    });
  } catch (error) {
    console.error("Toggle publish error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Publish new course version (Instructor/Admin)
exports.publishNewVersion = async (req, res) => {
  try {
    const { id } = req.params;

    const originalCourse = await Course.findByPk(id);

    if (!originalCourse) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Check permission
    if (
      originalCourse.instructorId !== req.user.userId &&
      req.user.roleName !== "ADMIN" &&
      req.user.roleName !== "SUPER_ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message:
          "You do not have permission to publish a new version of this course",
      });
    }

    // Publish new version using service (only increments version, doesn't create new course)
    const updatedCourse = await courseVersionService.publishNewVersion(
      id,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: `Course version updated to ${updatedCourse.version} successfully`,
      data: {
        course: updatedCourse,
        previousVersion: originalCourse.version,
        newVersion: updatedCourse.version,
      },
    });
  } catch (error) {
    console.error("Publish new version error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};
