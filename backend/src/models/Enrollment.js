const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Foreign key to users'
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Foreign key to courses'
  },
  progress: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    comment: 'Course completion percentage (0-100)'
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'DROPPED'),
    defaultValue: 'ACTIVE',
    comment: 'Enrollment status'
  },
  enrolledAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Enrollment timestamp'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Completion timestamp'
  },
  lastAccessedLessonId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'lessons',
      key: 'id'
    },
    comment: 'Last accessed lesson (for resume)'
  }
}, {
  tableName: 'enrollments',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['userId', 'courseId'] },
    { fields: ['userId'] },
    { fields: ['courseId'] },
    { fields: ['status'] }
  ]
});

module.exports = Enrollment;
