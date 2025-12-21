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
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Lesson description'
  },
  type: {
    type: DataTypes.ENUM('VIDEO', 'MATERIAL', 'LIVE_SESSION', 'ASSIGNMENT', 'QUIZ', 'EXAM', 'DISCUSSION'),
    allowNull: false,
    comment: 'Lesson content type'
  },
  content: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Lesson content as JSON (varies by type)'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Lesson duration in seconds (for videos/live sessions)'
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Lesson order in section'
  },
  isRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Is lesson required for course completion'
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

/**
 * Helper methods for content schema validation and access
 */

/**
 * Get content as object (handles both JSON string and object)
 */
Lesson.prototype.getContentObject = function() {
  if (!this.content) return null;
  
  if (typeof this.content === 'string') {
    try {
      return JSON.parse(this.content);
    } catch (e) {
      // If not JSON, return as string wrapped in object
      return { content: this.content };
    }
  }
  
  return this.content;
};

/**
 * Validate content schema based on lesson type
 */
Lesson.prototype.validateContentSchema = function() {
  const content = this.getContentObject();
  if (!content) return { valid: true };

  switch (this.type) {
    case 'VIDEO':
      if (!content.videoUrl) {
        return { valid: false, message: 'VIDEO lesson requires videoUrl in content' };
      }
      if (content.minWatchPercentage && (content.minWatchPercentage < 0 || content.minWatchPercentage > 100)) {
        return { valid: false, message: 'minWatchPercentage must be between 0 and 100' };
      }
      break;

    case 'MATERIAL':
      // MATERIAL can have either fileUrl or content
      if (!content.fileUrl && !content.content) {
        return { valid: false, message: 'MATERIAL lesson requires fileUrl or content in content object' };
      }
      break;

    case 'LIVE_SESSION':
      if (!content.meetingUrl) {
        return { valid: false, message: 'LIVE_SESSION lesson requires meetingUrl in content' };
      }
      break;

    case 'ASSIGNMENT':
      if (!content.instructions) {
        return { valid: false, message: 'ASSIGNMENT lesson requires instructions in content' };
      }
      if (content.submissionType && !['FILE', 'TEXT', 'LINK', 'ANY'].includes(content.submissionType)) {
        return { valid: false, message: 'submissionType must be FILE, TEXT, LINK, or ANY' };
      }
      break;

    case 'QUIZ':
    case 'EXAM':
      // Quiz/Exam content is optional (quizId may be set later)
      if (content.quizId && typeof content.quizId !== 'number') {
        return { valid: false, message: 'quizId must be a number' };
      }
      break;

    case 'DISCUSSION':
      // Discussion content is optional
      break;

    default:
      return { valid: true };
  }

  return { valid: true };
};

/**
 * Get content value by key (safe access)
 */
Lesson.prototype.getContentValue = function(key, defaultValue = null) {
  const content = this.getContentObject();
  return content?.[key] ?? defaultValue;
};

/**
 * Check if lesson has valid content structure
 */
Lesson.prototype.hasValidContent = function() {
  const validation = this.validateContentSchema();
  return validation.valid;
};

module.exports = Lesson;
