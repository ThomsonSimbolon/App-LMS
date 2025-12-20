const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Question text'
  },
  type: {
    type: DataTypes.ENUM('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'),
    allowNull: false,
    comment: 'Question type'
  },
  options: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Answer options (array for multiple choice: ["A", "B", "C", "D"])'
  },
  correctAnswer: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Correct answer (index for MC, "true"/"false" for TF, text for SA)'
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Points for this question'
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Question order in quiz'
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Explanation for the correct answer'
  }
}, {
  tableName: 'questions',
  timestamps: true,
  indexes: [
    { fields: ['quizId'] },
    { fields: ['quizId', 'order'] }
  ]
});

module.exports = Question;
