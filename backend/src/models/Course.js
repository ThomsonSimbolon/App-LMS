const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Course title'
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'URL-friendly course slug'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Course description'
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Cloudinary image URL'
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    },
    comment: 'Foreign key to categories'
  },
  instructorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Foreign key to users (instructor)'
  },
  level: {
    type: DataTypes.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
    defaultValue: 'BEGINNER',
    comment: 'Course difficulty level'
  },
  type: {
    type: DataTypes.ENUM('FREE', 'PAID', 'PREMIUM'),
    defaultValue: 'FREE',
    comment: 'Course type'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: 'Course price (0 for free courses)'
  },
  requireSequentialCompletion: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Require lessons to be completed in order'
  },
  requireManualApproval: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Require manual certificate approval'
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Course publish status'
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Publication timestamp'
  },
  version: {
    type: DataTypes.STRING,
    defaultValue: '1.0',
    allowNull: false,
    comment: 'Course version (e.g., 1.0, 1.1, 2.0) - for versioning system'
  }
}, {
  tableName: 'courses',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['slug'], name: 'courses_slug_unique' },
    { fields: ['categoryId'] },
    { fields: ['instructorId'] },
    { fields: ['isPublished'] },
    { fields: ['version'] }
  ]
});

module.exports = Course;
