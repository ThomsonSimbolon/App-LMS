const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ExamResult = sequelize.define('ExamResult', {
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
    comment: 'Foreign key to users'
  },
  quizId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'quizzes',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Foreign key to quizzes'
  },
  answers: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'User answers (JSON object: {questionId: answer})'
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Score percentage (0-100)'
  },
  totalPoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Total points earned'
  },
  maxPoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Maximum possible points'
  },
  isPassed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    comment: 'Pass/fail status'
  },
  attemptNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Attempt number for this quiz'
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Exam start timestamp'
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Exam submission timestamp'
  },
  timeSpent: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Time spent in seconds'
  }
}, {
  tableName: 'exam_results',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['quizId'] },
    { fields: ['userId', 'quizId'] },
    { fields: ['isPassed'] }
  ]
});

module.exports = ExamResult;
