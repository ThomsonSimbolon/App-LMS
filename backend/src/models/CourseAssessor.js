const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

/**
 * CourseAssessor Model
 * Pivot table for many-to-many relationship between Courses and Assessors (Users with ASSESSOR role)
 *
 * Business Rules:
 * - One course can have multiple assessors
 * - One assessor can handle multiple courses
 * - Only assigned assessors can approve certificates for that course
 * - ADMIN can approve as fallback even if no assessor assigned
 */
const CourseAssessor = sequelize.define(
  "CourseAssessor",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "courses",
        key: "id",
      },
      onDelete: "CASCADE",
      comment: "Foreign key to courses table",
    },
    assessorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      comment: "Foreign key to users table (must be ASSESSOR role)",
    },
  },
  {
    tableName: "course_assessors",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["courseId", "assessorId"],
        name: "unique_course_assessor",
      },
      {
        fields: ["courseId"],
      },
      {
        fields: ["assessorId"],
      },
    ],
  }
);

module.exports = CourseAssessor;
