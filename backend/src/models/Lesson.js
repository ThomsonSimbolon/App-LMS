const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sectionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sections',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Foreign key to sections'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Lesson title'
  },
  type: {
    type: DataTypes.ENUM('VIDEO', 'PDF', 'TEXT', 'QUIZ'),
    allowNull: false,
    comment: 'Lesson content type'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Lesson content (video URL, PDF URL, or text content)'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Lesson duration in seconds (for videos)'
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Lesson order in section'
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Is lesson available for preview (free)'
  }
}, {
  tableName: 'lessons',
  timestamps: true,
  indexes: [
    { fields: ['sectionId'] },
    { fields: ['sectionId', 'order'] },
    { fields: ['type'] }
  ]
});

module.exports = Lesson;
