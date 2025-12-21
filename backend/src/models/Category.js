const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Category name (e.g., Programming, Design, Business)'
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'URL-friendly category slug'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Category description'
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Icon name or path'
  }
}, {
  tableName: 'categories',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['name'], name: 'categories_name_unique' },
    { unique: true, fields: ['slug'], name: 'categories_slug_unique' }
  ]
});

module.exports = Category;
