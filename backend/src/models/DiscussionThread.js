const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DiscussionThread = sequelize.define('DiscussionThread', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'User who created the thread'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Thread title'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Thread content'
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether thread is pinned (instructor only)'
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether thread is locked (no new replies allowed)'
  },
  replyCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of replies in this thread (cached)'
  },
  lastReplyAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp of last reply (for sorting)'
  }
}, {
  tableName: 'discussion_threads',
  timestamps: true,
  indexes: [
    { fields: ['lessonId'] },
    { fields: ['userId'] },
    { fields: ['isPinned'] },
    { fields: ['createdAt'] },
    { fields: ['lastReplyAt'] },
    { fields: ['lessonId', 'isPinned', 'createdAt'] }
  ]
});

module.exports = DiscussionThread;

