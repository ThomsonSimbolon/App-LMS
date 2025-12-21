const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const sectionController = require("../controllers/sectionController");
const lessonController = require("../controllers/lessonController");
const courseAssessorController = require("../controllers/courseAssessorController");
const { verifyToken, hasRole } = require("../middleware/auth");
const multer = require("multer");

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Public routes
router.get("/", courseController.getAllCourses);

// Authenticated routes
router.get(
  "/my-courses",
  verifyToken,
  hasRole(["INSTRUCTOR", "ADMIN", "SUPER_ADMIN"]),
  courseController.getMyCourses
);

// Instructor route - Delete own course
router.delete(
  "/my-courses/:id",
  verifyToken,
  hasRole(["INSTRUCTOR"]),
  courseController.deleteMyCourse
);

// Admin routes - Get all courses (including unpublished)
router.get(
  "/admin/all",
  verifyToken,
  hasRole(["ADMIN", "SUPER_ADMIN"]),
  courseController.getAllCoursesAdmin
);

router.get("/:id", courseController.getCourseById);

// Instructor/Admin routes - Course management
router.post(
  "/",
  verifyToken,
  hasRole(["INSTRUCTOR", "ADMIN", "SUPER_ADMIN"]),
  upload.single("thumbnail"),
  courseController.createCourse
);

router.put(
  "/:id",
  verifyToken,
  hasRole(["INSTRUCTOR", "ADMIN", "SUPER_ADMIN"]),
  upload.single("thumbnail"),
  courseController.updateCourse
);

router.delete(
  "/:id",
  verifyToken,
  hasRole(["ADMIN", "SUPER_ADMIN"]),
  courseController.deleteCourse
);

// Assign instructor to course (Admin only)
router.patch(
  "/:id/assign-instructor",
  verifyToken,
  hasRole(["ADMIN", "SUPER_ADMIN"]),
  courseController.assignInstructor
);

router.patch(
  "/:id/publish",
  verifyToken,
  hasRole(["INSTRUCTOR", "ADMIN", "SUPER_ADMIN"]),
  courseController.togglePublish
);

// Publish new course version
router.post(
  "/:id/publish-new-version",
  verifyToken,
  hasRole(["INSTRUCTOR", "ADMIN", "SUPER_ADMIN"]),
  courseController.publishNewVersion
);

// Section management
router.post(
  "/:courseId/sections",
  verifyToken,
  hasRole(["INSTRUCTOR", "ADMIN", "SUPER_ADMIN"]),
  sectionController.createSection
);

router.put(
  "/sections/:id",
  verifyToken,
  hasRole(["INSTRUCTOR", "ADMIN", "SUPER_ADMIN"]),
  sectionController.updateSection
);

router.delete(
  "/sections/:id",
  verifyToken,
  hasRole(["INSTRUCTOR", "ADMIN", "SUPER_ADMIN"]),
  sectionController.deleteSection
);

// Lesson management
router.post(
  "/sections/:sectionId/lessons",
  verifyToken,
  hasRole(["INSTRUCTOR", "ADMIN", "SUPER_ADMIN"]),
  upload.single("file"),
  lessonController.createLesson
);

router.put(
  "/lessons/:id",
  verifyToken,
  hasRole(["INSTRUCTOR", "ADMIN", "SUPER_ADMIN"]),
  upload.single("file"),
  lessonController.updateLesson
);

router.delete(
  "/lessons/:id",
  verifyToken,
  hasRole(["INSTRUCTOR", "ADMIN", "SUPER_ADMIN"]),
  lessonController.deleteLesson
);

// Course Assessor Management (Admin/Super Admin only)
router.post(
  "/:courseId/assessors",
  verifyToken,
  hasRole(["ADMIN", "SUPER_ADMIN"]),
  courseAssessorController.assignAssessors
);

router.get(
  "/:courseId/assessors",
  verifyToken,
  hasRole(["ADMIN", "SUPER_ADMIN", "INSTRUCTOR"]),
  courseAssessorController.getAssignedAssessors
);

module.exports = router;
