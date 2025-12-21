const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
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
    comment: 'User who receives the notification'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Notification title'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Notification message content'
  },
  type: {
    type: DataTypes.ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR'),
    defaultValue: 'INFO',
    comment: 'Notification type for styling'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether the notification has been read'
  },
  // Optional: Link to related entity
  entityType: {
    type: DataTypes.ENUM('COURSE', 'QUIZ', 'CERTIFICATE', 'ENROLLMENT', 'SYSTEM'),
    allowNull: true,
    comment: 'Type of related entity (for navigation)'
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID of related entity (for navigation)'
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  updatedAt: false, // Notifications are immutable after creation
  indexes: [
    { fields: ['userId'] },
    { fields: ['isRead'] },
    { fields: ['createdAt'] },
    { fields: ['userId', 'isRead'] },
    { fields: ['entityType', 'entityId'] }
  ]
});

module.exports = Notification;

