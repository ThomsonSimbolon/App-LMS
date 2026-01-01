const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DiscussionReply = sequelize.define('DiscussionReply', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  threadId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'discussion_threads',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Foreign key to discussion_threads'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'User who created the reply'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Reply content'
  },
  parentReplyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'discussion_replies',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'Parent reply ID for nested replies (reply-to-reply)'
  }
}, {
  tableName: 'discussion_replies',
  timestamps: true,
  indexes: [
    { fields: ['threadId'] },
    { fields: ['userId'] },
    { fields: ['parentReplyId'] },
    { fields: ['createdAt'] },
    { fields: ['threadId', 'createdAt'] }
  ]
});

module.exports = DiscussionReply;

