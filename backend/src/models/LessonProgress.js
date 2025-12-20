const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LessonProgress = sequelize.define('LessonProgress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  enrollmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'enrollments',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Foreign key to enrollments'
  },
  lessonId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'lessons',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Foreign key to lessons'
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Lesson completion status'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Completion timestamp'
  },
  watchTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total watch time in seconds (for videos)'
  }
}, {
  tableName: 'lesson_progress',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['enrollmentId', 'lessonId'] },
    { fields: ['enrollmentId'] },
    { fields: ['lessonId'] },
    { fields: ['isCompleted'] }
  ]
});

module.exports = LessonProgress;
