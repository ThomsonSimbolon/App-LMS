// Import all models
const User = require("./User");
const Role = require("./Role");
const Permission = require("./Permission");
const RolePermission = require("./RolePermission");
const Category = require("./Category");
const Course = require("./Course");
const Section = require("./Section");
const Lesson = require("./Lesson");
const Enrollment = require("./Enrollment");
const LessonProgress = require("./LessonProgress");
const Quiz = require("./Quiz");
const Question = require("./Question");
const ExamResult = require("./ExamResult");
const Certificate = require("./Certificate");
const ActivityLog = require("./ActivityLog");
const Notification = require("./Notification");
const CourseAssessor = require("./CourseAssessor");

// ========================================
// AUTHENTICATION & RBAC ASSOCIATIONS
// ========================================

// User belongs to Role
User.belongsTo(Role, {
  foreignKey: "roleId",
  as: "role",
});

Role.hasMany(User, {
  foreignKey: "roleId",
  as: "users",
});

// Role-Permission Many-to-Many
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: "roleId",
  otherKey: "permissionId",
  as: "permissions",
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: "permissionId",
  otherKey: "roleId",
  as: "roles",
});

// ========================================
// COURSE MANAGEMENT ASSOCIATIONS
// ========================================

// Category has many Courses
Category.hasMany(Course, {
  foreignKey: "categoryId",
  as: "courses",
});

Course.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

// Instructor (User) has many Courses
User.hasMany(Course, {
  foreignKey: "instructorId",
  as: "instructedCourses",
});

Course.belongsTo(User, {
  foreignKey: "instructorId",
  as: "instructor",
});

// Course has many Sections
Course.hasMany(Section, {
  foreignKey: "courseId",
  as: "sections",
  onDelete: "CASCADE",
});

Section.belongsTo(Course, {
  foreignKey: "courseId",
  as: "course",
});

// Section has many Lessons
Section.hasMany(Lesson, {
  foreignKey: "sectionId",
  as: "lessons",
  onDelete: "CASCADE",
});

Lesson.belongsTo(Section, {
  foreignKey: "sectionId",
  as: "section",
});

// ========================================
// ENROLLMENT & PROGRESS ASSOCIATIONS
// ========================================

// User has many Enrollments
User.hasMany(Enrollment, {
  foreignKey: "userId",
  as: "enrollments",
  onDelete: "CASCADE",
});

Enrollment.belongsTo(User, {
  foreignKey: "userId",
  as: "student",
});

// Course has many Enrollments
Course.hasMany(Enrollment, {
  foreignKey: "courseId",
  as: "enrollments",
  onDelete: "CASCADE",
});

Enrollment.belongsTo(Course, {
  foreignKey: "courseId",
  as: "course",
});

// Enrollment has many LessonProgress
Enrollment.hasMany(LessonProgress, {
  foreignKey: "enrollmentId",
  as: "lessonProgress",
  onDelete: "CASCADE",
});

LessonProgress.belongsTo(Enrollment, {
  foreignKey: "enrollmentId",
  as: "enrollment",
});

// Lesson has many LessonProgress
Lesson.hasMany(LessonProgress, {
  foreignKey: "lessonId",
  as: "progress",
  onDelete: "CASCADE",
});

LessonProgress.belongsTo(Lesson, {
  foreignKey: "lessonId",
  as: "lesson",
});

// Last accessed lesson reference
Enrollment.belongsTo(Lesson, {
  foreignKey: "lastAccessedLessonId",
  as: "lastAccessedLesson",
});

// ========================================
// QUIZ & ASSESSMENT ASSOCIATIONS
// ========================================

// Lesson has one Quiz (optional)
Lesson.hasOne(Quiz, {
  foreignKey: "lessonId",
  as: "quiz",
  onDelete: "CASCADE",
});

Quiz.belongsTo(Lesson, {
  foreignKey: "lessonId",
  as: "lesson",
});

// Course has many Quizzes (for final exams)
Course.hasMany(Quiz, {
  foreignKey: "courseId",
  as: "quizzes",
  onDelete: "CASCADE",
});

Quiz.belongsTo(Course, {
  foreignKey: "courseId",
  as: "course",
});

// Quiz has many Questions
Quiz.hasMany(Question, {
  foreignKey: "quizId",
  as: "questions",
  onDelete: "CASCADE",
});

Question.belongsTo(Quiz, {
  foreignKey: "quizId",
  as: "quiz",
});

// User has many ExamResults
User.hasMany(ExamResult, {
  foreignKey: "userId",
  as: "examResults",
  onDelete: "CASCADE",
});

ExamResult.belongsTo(User, {
  foreignKey: "userId",
  as: "student",
});

// Quiz has many ExamResults
Quiz.hasMany(ExamResult, {
  foreignKey: "quizId",
  as: "results",
  onDelete: "CASCADE",
});

ExamResult.belongsTo(Quiz, {
  foreignKey: "quizId",
  as: "quiz",
});

// ========================================
// CERTIFICATE ASSOCIATIONS
// ========================================

// User has many Certificates
User.hasMany(Certificate, {
  foreignKey: "userId",
  as: "certificates",
  onDelete: "CASCADE",
});

Certificate.belongsTo(User, {
  foreignKey: "userId",
  as: "student",
});

// Course has many Certificates
Course.hasMany(Certificate, {
  foreignKey: "courseId",
  as: "certificates",
  onDelete: "CASCADE",
});

Certificate.belongsTo(Course, {
  foreignKey: "courseId",
  as: "course",
});

// Approver (User) has many approved Certificates
User.hasMany(Certificate, {
  foreignKey: "approvedBy",
  as: "approvedCertificates",
});

Certificate.belongsTo(User, {
  foreignKey: "approvedBy",
  as: "approver",
});

// ========================================
// ACTIVITY LOG ASSOCIATIONS
// ========================================

// User has many ActivityLogs
User.hasMany(ActivityLog, {
  foreignKey: "userId",
  as: "activityLogs",
  onDelete: "SET NULL",
});

ActivityLog.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  required: false,
});

// ========================================
// NOTIFICATION ASSOCIATIONS
// ========================================

// User has many Notifications
User.hasMany(Notification, {
  foreignKey: "userId",
  as: "notifications",
  onDelete: "CASCADE",
});

Notification.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// ========================================
// COURSE ASSESSOR ASSOCIATIONS
// ========================================

// Course has many Assessors (many-to-many)
Course.belongsToMany(User, {
  through: CourseAssessor,
  foreignKey: "courseId",
  otherKey: "assessorId",
  as: "assessors",
  constraints: false,
});

// User (Assessor) has many Courses (many-to-many)
User.belongsToMany(Course, {
  through: CourseAssessor,
  foreignKey: "assessorId",
  otherKey: "courseId",
  as: "assignedCourses",
  constraints: false,
});

// CourseAssessor belongs to Course
CourseAssessor.belongsTo(Course, {
  foreignKey: "courseId",
  as: "course",
});

// CourseAssessor belongs to User (Assessor)
CourseAssessor.belongsTo(User, {
  foreignKey: "assessorId",
  as: "assessor",
});

// Course has many CourseAssessors
Course.hasMany(CourseAssessor, {
  foreignKey: "courseId",
  as: "courseAssessors",
  onDelete: "CASCADE",
});

// User (Assessor) has many CourseAssessors
User.hasMany(CourseAssessor, {
  foreignKey: "assessorId",
  as: "assessorAssignments",
  onDelete: "CASCADE",
});

// Export all models
module.exports = {
  // Authentication & RBAC
  User,
  Role,
  Permission,
  RolePermission,

  // Course Management
  Category,
  Course,
  Section,
  Lesson,

  // Enrollment & Progress
  Enrollment,
  LessonProgress,

  // Assessment
  Quiz,
  Question,
  ExamResult,

  // Certification
  Certificate,
  CourseAssessor,

  // Activity Logging
  ActivityLog,

  // Notifications
  Notification,
};
