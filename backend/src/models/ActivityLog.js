const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'User who performed the action (nullable for system events)'
  },
  eventType: {
    type: DataTypes.ENUM(
      'USER_LOGIN',
      'COURSE_ENROLL',
      'LESSON_COMPLETE',
      'QUIZ_SUBMIT',
      'CERT_REQUESTED',
      'CERT_APPROVED',
      'CERT_REJECTED'
    ),
    allowNull: false,
    comment: 'Type of event that occurred'
  },
  entityType: {
    type: DataTypes.ENUM('USER', 'COURSE', 'QUIZ', 'CERTIFICATE', 'SYSTEM'),
    allowNull: false,
    comment: 'Type of entity involved in the event'
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID of the entity involved (courseId, quizId, certificateId, etc.)'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional event data (JSON format)'
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'IP address of the user (supports IPv6)'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User agent string from the request'
  }
}, {
  tableName: 'activity_logs',
  timestamps: true,
  updatedAt: false, // Activity logs are immutable, only createdAt
  indexes: [
    { fields: ['userId'] },
    { fields: ['eventType'] },
    { fields: ['entityType'] },
    { fields: ['entityId'] },
    { fields: ['createdAt'] },
    { fields: ['userId', 'eventType'] },
    { fields: ['entityType', 'entityId'] }
  ]
});

module.exports = ActivityLog;

