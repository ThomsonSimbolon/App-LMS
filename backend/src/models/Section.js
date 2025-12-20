const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Section = sequelize.define('Section', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Section title'
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Section order in course'
  }
}, {
  tableName: 'sections',
  timestamps: true,
  indexes: [
    { fields: ['courseId'] },
    { fields: ['courseId', 'order'] }
  ]
});

module.exports = Section;
