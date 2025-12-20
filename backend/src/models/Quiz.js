const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Quiz = sequelize.define('Quiz', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  lessonId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'lessons',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Foreign key to lessons (NULL for standalone quiz)'
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'courses',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Foreign key to courses (for final exam)'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Quiz title'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Quiz description/instructions'
  },
  type: {
    type: DataTypes.ENUM('PRACTICE', 'EXAM', 'FINAL_EXAM'),
    defaultValue: 'PRACTICE',
    comment: 'Quiz type'
  },
  passingScore: {
    type: DataTypes.INTEGER,
    defaultValue: 70,
    comment: 'Minimum score to pass (percentage)'
  },
  timeLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Time limit in minutes (NULL for no limit)'
  },
  maxAttempts: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Maximum attempts allowed (NULL for unlimited)'
  },
  randomizeQuestions: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Randomize question order'
  },
  showAnswersAfterSubmit: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Show correct answers after submission'
  }
}, {
  tableName: 'quizzes',
  timestamps: true,
  indexes: [
    { fields: ['lessonId'] },
    { fields: ['courseId'] },
    { fields: ['type'] }
  ]
});

module.exports = Quiz;
